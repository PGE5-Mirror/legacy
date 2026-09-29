import { Response } from 'express';

export function createStandardControllerMocks(field: any) {
  const mockReq = field;

  const mockRes: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  };

  return { mockReq, mockRes };
}