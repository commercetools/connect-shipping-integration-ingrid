/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpHandler, HttpResponse } from 'msw';

function createMockResponse(respCode: number, data?: any): HttpResponse {
  if (respCode === 401) {
    const errorData = {
      error: 'invalid_client',
      error_description: 'Client Authentication failed',
    };
    return HttpResponse.json(objectToReadableStream(errorData), {
      status: respCode,
    });
  }

  if (respCode >= 299) {
    const errorData = {
      name: 'SOME_ERROR_NAME',
      message: 'an error occurred in ingrid',
      debug_id: '12345678',
    };
    return HttpResponse.json(objectToReadableStream(errorData), {
      status: respCode,
    });
  }
  return HttpResponse.json(data);
}

export const mockHead = (basePath: string, uri: string, respCode: number, data?: any): HttpHandler => {
  return http.head(`${basePath}${uri}`, () => {
    return createMockResponse(respCode, data);
  });
};

export const mockGet = (basePath: string, uri: string, respCode: number, data?: any): HttpHandler => {
  return http.get(`${basePath}${uri}`, () => {
    return createMockResponse(respCode, data);
  });
};

export const mockPost = (basePath: string, uri: string, respCode: number, data?: any): HttpHandler => {
  return http.post(`${basePath}${uri}`, () => {
    return createMockResponse(respCode, data);
  });
};

export const mockRequest = (basePath: string, uri: string, respCode: number, data?: any): HttpHandler => {
  return http.all(`${basePath}${uri}`, () => {
    return createMockResponse(respCode, data);
  });
};

function objectToReadableStream(obj: any) {
  const jsonString = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(jsonString);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(uint8Array);
      controller.close();
    },
  });

  return stream;
}
