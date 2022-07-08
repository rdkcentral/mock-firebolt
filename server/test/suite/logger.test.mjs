'use strict'
import  {logger} from '../../src/logger.mjs';
import { jest } from "@jest/globals";

test('should first', () => { 
    const spy=jest.spyOn(console,'log');
    logger.debug('testDebug');
    logger.err('test err')
    logger.error('test error')
    logger.important('test important')
    logger.info('test info');
    logger.warn('test warn');
    logger.warning('test warning');
    expect(spy).toHaveBeenCalledTimes(7);
 })