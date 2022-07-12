'use strict'

import { jest } from "@jest/globals";
import express from "express";
import  {configureAPI} from '../../src/configureAPI.mjs'

test('should first', () => { 
    const app=express();
    const spy1=jest.spyOn(app,'get');
    const spy2=jest.spyOn(app,'post');
    configureAPI(app);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(1).toBe(1);
 })