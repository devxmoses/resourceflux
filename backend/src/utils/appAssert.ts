import assert from 'node:assert';
import { AppError } from './errors.js';
import { HTTP_STATUS } from '../constants/http.js';

type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

function appAssert(condition: unknown, statusCode: HttpStatus, message: string): asserts condition {
    assert(condition, new AppError(statusCode, message));
}

export default appAssert;
