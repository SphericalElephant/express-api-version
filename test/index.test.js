'use strict';
/* eslint-env node, mocha */
/* eslint no-unused-expressions: "off" */
/* eslint max-len: ["error", { code: 140, "ignoreTemplateLiterals": true }] */

const {VersionManager, MiddlewareFactory} = require('../index');
const {expect} = require('chai');

function constructorWrapper(ctr, opts) {
  return new ctr(opts);
}

describe('express-api-version', () => {
  describe('MiddlewareFactory', () => {
    describe('MiddlewareFactory()', () => {
      it('should check if opts are provided', () => {
        expect(constructorWrapper.bind(null, MiddlewareFactory)).to.throw('not opts provided');
      });
      it('should check if supportedVersions are provided', () => {
        expect(constructorWrapper.bind(null, MiddlewareFactory, {})).to.throw('invalid opts.supportedVersions:');
      });
      it('should check if supportedVersions versions are an array', () => {
        expect(constructorWrapper.bind(null, MiddlewareFactory, {supportedVersions: 'test'})).to.throw('invalid opts.supportedVersions:');
      });
      it('should check if supportedVersions versions are valid', () => {
        expect(constructorWrapper.bind(null, MiddlewareFactory, {supportedVersions: ['1.1']})).to.throw('invalid version');
      });
      it('should check if vndExtension is set', () => {
        expect(constructorWrapper.bind(null, MiddlewareFactory, {supportedVersions: ['1.1.1']})).to.throw('no opts.vndExtension set!');
      });
      it('should let the call pass if everything is ok', () => {
        expect(constructorWrapper.bind(null, MiddlewareFactory, {supportedVersions: ['1.1.1'], vndExtension: 'test'})).not.to.throw();
      });
    });
    describe('getVndExtensions', () => {
      it('should return a list of valid Content-Types', () => {
        const middlewareFactory = new MiddlewareFactory({
          vndExtension: 'test-vendor',
          supportedVersions: ['1.0.0', '1.1.1', '2.0.0', '2.2.2']
        });
        expect(middlewareFactory.getVndExtensions()).to.deep.equal([
          'application/vnd.api-test-vendor-1.0.0+json',
          'application/vnd.api-test-vendor-1.1.1+json',
          'application/vnd.api-test-vendor-2.0.0+json',
          'application/vnd.api-test-vendor-2.2.2+json'
        ]);
      });
    });
    describe('createMiddleware', () => {
      it('should create a middleware that uses opts.attachVersionKey', () => {
        const middlewareFactory = new MiddlewareFactory({
          vndExtension: 'test-vendor',
          supportedVersions: ['1.0.0', '1.1.1', '2.0.0', '2.2.2'],
          attachVersionKey: 'customKey'
        });
        const middleware = middlewareFactory.createMiddleware();
        const req = {
          get(field) {
            if (field === 'Content-Type') return 'application/vnd.api-test-vendor-1.0.0+json';
          }
        };
        middleware(req, {}, () => {});
        expect(req['customKey']).to.equal('1.1.1');
      });
      it('should create a middleware that uses __api_version as default key if opts.attachVersionKey was not supplied', () => {
        const middlewareFactory = new MiddlewareFactory({
          vndExtension: 'test-vendor',
          supportedVersions: ['1.0.0', '1.1.1', '2.0.0', '2.2.2']
        });
        const middleware = middlewareFactory.createMiddleware();
        const req = {
          get(field) {
            if (field === 'Content-Type') return 'application/vnd.api-test-vendor-1.0.0+json';
          }
        };
        middleware(req, {}, () => {});
        expect(req['__api_version']).to.equal('1.1.1');
      });
      it('should not attach a version if it could not be parsed from the header', () => {
        const middlewareFactory = new MiddlewareFactory({
          vndExtension: 'test-vendor',
          supportedVersions: ['1.0.0', '1.1.1', '2.0.0', '2.2.2']
        });
        const middleware = middlewareFactory.createMiddleware();
        const req = {
          get(field) {
            if (field === 'Content-Type') return 'application/vnd.api-test-vendor-';
          }
        };
        middleware(req, {}, () => {});
        expect(req['__api_version']).to.be.null;
      });
      it('should not attach a version if the version of the header was invalid', () => {
        const middlewareFactory = new MiddlewareFactory({
          vndExtension: 'test-vendor',
          supportedVersions: ['1.0.0', '1.1.1', '2.0.0', '2.2.2']
        });
        const middleware = middlewareFactory.createMiddleware();
        const req = {
          get(field) {
            if (field === 'Content-Type') return 'application/vnd.api-test-vendor-5.0.0+json';
          }
        };
        middleware(req, {}, () => {});
        expect(req['__api_version']).to.be.null;
      });
    });
  });
  describe('VersionManager', () => {
    describe('getFittingVersion', () => {
      it('should get the highest fitting version', () => {
        const versionManager = new VersionManager({
          supportedVersions: ['1.0.0', '1.2.5', '2.0.0', '2.0.1', '1.0.3', '1.2.4', '3.1.1', '2.6.5'],
          vndExtension: 'test-vendor'
        });
        expect(versionManager.getFittingVersion('1.1.1')).to.equal('1.2.5');
        expect(versionManager.getFittingVersion('2.0.0')).to.equal('2.6.5');
      });
      it('should return null if the provided version cannot be satisfied', () => {
        const versionManager = new VersionManager({supportedVersions: ['2.2.2'], vndExtension: 'test-vendor'});
        expect(versionManager.getFittingVersion('1.1.1')).to.be.null;
      });
    });
    describe('parseVersionFromHeader', () => {
      it('should return the correct version from the vnd version string', () => {
        const versionManager = new VersionManager({vndExtension: 'test-vendor'});
        expect(versionManager.parseVersionFromHeader('application/vnd.api-test-vendor-1.2.3+json')).to.equal('1.2.3');
      });
      it('should return null when an invalid version header was found', () => {
        const versionManager = new VersionManager({vndExtension: 'test-vendor'});
        expect(versionManager.parseVersionFromHeader('application/vnd.api-test-vendor-')).to.equal(null);
      });
    });
  });
});
