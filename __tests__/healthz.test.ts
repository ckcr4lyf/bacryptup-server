import { request, Request, Response } from 'express';
import healthzHandler from '../source/api/controllers/healthz';
import mockResponse from '../__mocks__/response.mock';

test("Healthz should be 200", async () => {
    const mockRequest: any = {};
    const response: any = new mockResponse();

    await healthzHandler(mockRequest, response);
    expect(response.statusCode).toBe(200);
});