'use strict'

import { jest } from "@jest/globals";
import express from "express";
import  {configureUI} from '../../src/configureUI.mjs'

test('configureUI working properly', () => { 
    const app=express();
    const spy=jest.spyOn(app,'get');
    configureUI(app);
    expect(spy).toHaveBeenCalled();
 })