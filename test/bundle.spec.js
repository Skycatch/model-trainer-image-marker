'use strict';

import chai from 'chai';
import Lib from '../dist/bundle.js';

chai.expect();

const expect = chai.expect;

describe('Library Tests', () => {
  before(() => {
  });
  describe('When I am referenced in an application', () => {
    it('should return a function', () => {
      expect(typeof(Lib)).to.be.equal('function');
    });
  });
});
