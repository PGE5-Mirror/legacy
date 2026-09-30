import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthForm } from '../../../src/client/components/AuthForm';

type AuthFormProps = React.ComponentProps<typeof AuthForm>;

function renderForm(overrides: Partial<AuthFormProps> = {}) {
  const props: AuthFormProps = {
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    tosAccepted: false,
    setToSAccepted: jest.fn(),
    // app.tsx prevents the default submit too; jsdom can't navigate
    onSubmit: jest.fn((event: React.FormEvent) => event.preventDefault()),
    isRegistering: false,
    toggleMode: jest.fn(),
    error: '',
    successMessage: '',
    loading: false,
    ...overrides,
  };

  const { rerender } = render(<AuthForm {...props} />);
  return { props, rerender: (changes: Partial<AuthFormProps>) => rerender(<AuthForm {...props} {...changes} />) };
}

// The Email/Password labels aren't linked to their inputs, so the fields are found by placeholder
function emailInput() {
  return screen.getByPlaceholderText('name@example.com');
}

function passwordInput() {
  return screen.getByPlaceholderText('Password');
}

describe('AuthForm', () => {
  it('calls the setters when typing the email and password', () => {
    const { props } = renderForm();

    fireEvent.change(emailInput(), { target: { value: 'alice@test.com' } });
    fireEvent.change(passwordInput(), { target: { value: 'secret123' } });

    expect(props.setEmail).toHaveBeenCalledWith('alice@test.com');
    expect(props.setPassword).toHaveBeenCalledWith('secret123');
  });

  it('only shows the Terms of Service checkbox when registering', () => {
    const { props, rerender } = renderForm();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    rerender({ isRegistering: true });
    fireEvent.click(screen.getByRole('checkbox', { name: 'I accept the Terms of Service' }));

    expect(props.setToSAccepted).toHaveBeenCalledWith(true);
  });

  it('calls onSubmit when the form is submitted', () => {
    const { props } = renderForm({ email: 'alice@test.com', password: 'secret123' });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables the button while loading', () => {
    const { rerender } = renderForm({ loading: true });
    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();

    rerender({ loading: true, isRegistering: true });
    expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
  });

  it('switches between login and register', () => {
    const { props, rerender } = renderForm();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(props.toggleMode).toHaveBeenCalledTimes(1);

    rerender({ isRegistering: true });
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(props.toggleMode).toHaveBeenCalledTimes(2);
  });

  it('displays the error and success messages', () => {
    const { rerender } = renderForm();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender({ error: 'Invalid credentials', successMessage: 'Account created' });

    expect(screen.getByText('Invalid credentials')).toHaveClass('alert-danger');
    expect(screen.getByText('Account created')).toHaveClass('alert-success');
  });
});
