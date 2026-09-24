function App() {
  const [token, setToken] = React.useState(() => localStorage.getItem('authToken') || '');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const { Container, Row, Col } = ReactBootstrap;

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const endpoint = isRegistering ? '/register' : '/login';

    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    })
        .then((r) => {
          if (!r.ok) throw new Error(isRegistering ? 'Registration failed' : 'Invalid credentials');
          return r.json();
        })
        .then((data) => {
          const receivedToken = data.token || data.access_token || (typeof data === 'string' ? data : null);

          if (typeof receivedToken === 'string') {
            localStorage.setItem('authToken', receivedToken);
            setToken(receivedToken);
            setLoading(false);
          } else if (isRegistering) {
            // Fallback auto-login après inscription si pas de token
            return fetch('/login', {
              method: 'POST',
              body: JSON.stringify({ email, password }),
              headers: { 'Content-Type': 'application/json' },
            })
                .then((loginRes) => {
                  if (!loginRes.ok) throw new Error('Auto-login failed after registration');
                  return loginRes.json();
                })
                .then((loginData) => {
                  const loginToken = loginData.token || loginData.access_token || loginData;
                  if (typeof loginToken === 'string') {
                    localStorage.setItem('authToken', loginToken);
                    setToken(loginToken);
                  } else {
                    throw new TypeError('Invalid token format');
                  }
                  setLoading(false);
                });
          } else {
            throw new TypeError('Invalid token format');
          }
        })
        .catch((err) => {
          setError(err.message || 'Authentication error');
          setLoading(false);
        });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
  };

  return (
      <Container className="mt-4">
        {token && (
            <div className="d-flex justify-content-end mb-3">
              <ReactBootstrap.Button variant="outline-danger" size="sm" onClick={handleLogout}>
                Logout
              </ReactBootstrap.Button>
            </div>
        )}
        <Row>
          <Col md={{ offset: 3, span: 6 }}>
            {!token ? (
                <AuthForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    onSubmit={handleAuth}
                    isRegistering={isRegistering}
                    toggleMode={() => {
                      setIsRegistering(!isRegistering);
                      setError('');
                      setSuccessMessage('');
                    }}
                    error={error}
                    successMessage={successMessage}
                    loading={loading}
                />
            ) : (
                <TodoListCard token={token} />
            )}
          </Col>
        </Row>
      </Container>
  );
}

function AuthForm({
                    email,
                    setEmail,
                    password,
                    setPassword,
                    onSubmit,
                    isRegistering,
                    toggleMode,
                    error,
                    successMessage,
                    loading,
                  }) {
  const { Form, Button, Alert } = ReactBootstrap;

  return (
      <div className="card mt-5 shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">
            {isRegistering ? 'Create Account' : 'Login'}
          </h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100 mt-2" disabled={loading}>
              {loading
                  ? isRegistering ? 'Creating account...' : 'Connecting...'
                  : isRegistering ? 'Sign Up' : 'Login'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <button
                  type="button"
                  className="btn btn-link text-success fw-bold p-0 align-baseline text-decoration-underline"
                  onClick={toggleMode}
              >
                {isRegistering ? 'Log in' : 'Sign up'}
              </button>
            </small>
          </div>
        </div>
      </div>
  );
}

function TodoListCard({ token }) {
  const [items, setItems] = React.useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  React.useEffect(() => {
    fetch('/items', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
        .then((r) => {
          if (r.status === 401) {
            localStorage.removeItem('authToken');
            window.location.reload();
          }
          return r.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setItems(data);
          } else if (data && Array.isArray(data.items)) {
            setItems(data.items);
          } else {
            setItems([]);
          }
        })
        .catch(() => {
          setItems([]);
        });
  }, [token]);

  const onNewItem = React.useCallback(
      (newItem) => {
        setItems((prevItems) => [...(Array.isArray(prevItems) ? prevItems : []), newItem]);
      },
      [],
  );

  const onItemUpdate = React.useCallback(
      (item) => {
        if (!Array.isArray(items)) return;
        const index = items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
          setItems([...items.slice(0, index), item, ...items.slice(index + 1)]);
        }
      },
      [items],
  );

  const onItemRemoval = React.useCallback(
      (item) => {
        if (!Array.isArray(items)) return;
        const index = items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
          setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        }
      },
      [items],
  );

  if (items === null) return 'Loading...';

  return (
      <React.Fragment>
        <AddItemForm onNewItem={onNewItem} authHeaders={authHeaders} />
        {items.length === 0 && <p className="text-center">No items yet! Add one above!</p>}
        {items.map((item) => (
            <ItemDisplay
                item={item}
                key={item.id}
                onItemUpdate={onItemUpdate}
                onItemRemoval={onItemRemoval}
                authHeaders={authHeaders}
            />
        ))}
      </React.Fragment>
  );
}

function AddItemForm({ onNewItem, authHeaders }) {
  const { Form, InputGroup, Button } = ReactBootstrap;

  const [newItem, setNewItem] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const submitNewItem = (e) => {
    e.preventDefault();
    setSubmitting(true);
    fetch('/items', {
      method: 'POST',
      body: JSON.stringify({ name: newItem }),
      headers: authHeaders,
    })
        .then((r) => r.json())
        .then((item) => {
          onNewItem(item);
          setSubmitting(false);
          setNewItem('');
        })
        .catch(() => setSubmitting(false));
  };

  return (
      <Form onSubmit={submitNewItem}>
        <InputGroup className="mb-3">
          <Form.Control
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              type="text"
              placeholder="New Item"
              aria-describedby="basic-addon1"
          />
          <InputGroup.Append>
            <Button
                type="submit"
                variant="success"
                disabled={!newItem.length}
                className={submitting ? 'disabled' : ''}
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
  );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval, authHeaders }) {
  const { Container, Row, Col, Button } = ReactBootstrap;

  const toggleCompletion = () => {
    fetch(`/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: item.name,
        completed: !item.completed,
      }),
      headers: authHeaders,
    })
        .then((r) => r.json())
        .then(onItemUpdate);
  };

  const removeItem = () => {
    fetch(`/items/${item.id}`, {
      method: 'DELETE',
      headers: authHeaders
    }).then(() => onItemRemoval(item));
  };

  return (
      <Container fluid className={`item ${item.completed && 'completed'}`}>
        <Row>
          <Col xs={1} className="text-center">
            <Button
                className="toggles"
                size="sm"
                variant="link"
                onClick={toggleCompletion}
                aria-label={item.completed ? 'Mark item as incomplete' : 'Mark item as complete'}
            >
              <i className={`far ${item.completed ? 'fa-check-square' : 'fa-square'}`} />
            </Button>
          </Col>
          <Col xs={10} className="name">
            {item.name}
          </Col>
          <Col xs={1} className="text-center remove">
            <Button size="sm" variant="link" onClick={removeItem} aria-label="Remove Item">
              <i className="fa fa-trash text-danger" />
            </Button>
          </Col>
        </Row>
      </Container>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));