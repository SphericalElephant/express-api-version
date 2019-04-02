'use strict';

const semver = require('semver');

class VersionManager {
  constructor(opts) {
    this.supportedVersions = opts.supportedVersions;
    this.vndExtension = this.escapeRegExp(opts.vndExtension);
  }

  /**
   * Finds the heighest fitting supported version for the input version.
   * @param {*} version the version the input version
   */
  getFittingVersion(version) {
    const caretVersion = `^${version}`
    return semver.maxSatisfying(this.supportedVersions, semver.validRange(caretVersion))
  }

  /**
   * Escapes the provided input for safe use in regular expressions.
   * @param {string} string
   */
  escapeRegExp(string) {
    // taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Parses the version number from the provided mimetype.
   * @param {string} header
   */
  parseVersionFromHeader(header) {
    const regex = new RegExp(`application/vnd.api\\-${this.vndExtension}\\-(.*?)\\+json`, 'gi');
    const result = regex.exec(header);
    if (!result || result[1] === '') return null;
    return result[1];
  }
}

class MiddlewareFactory {
  constructor(opts) {
    this.validateOptionsOrThrow(opts);
    this.versionManager = new VersionManager(opts);
    this.vndExtension = opts.vndExtension;
    this.supportedVersions = opts.supportedVersions;
    this.apiVersionKey = opts.attachVersionKey || '__api_version';
  }

  validateOptionsOrThrow(opts) {
    if (!opts)
      throw new Error('not opts provided');
    if (!opts.supportedVersions || !(opts.supportedVersions instanceof Array))
      throw new Error(`invalid opts.supportedVersions: ${opts.supportedVersions}`);
    opts.supportedVersions.forEach(version => {
      if (!semver.valid(version)) {
        throw new Error(`invalid version ${version}`);
      }
    });
    if (!opts.vndExtension)
      throw new Error('no opts.vndExtension set!');
  }

  getVndExtensions() {
    return this.supportedVersions.map(version => {
      return `application/vnd.api-${this.vndExtension}-${version}+json`;
    });
  }

  createMiddleware() {
    return (req, _, next) => {
      const contentType = req.get('Content-Type');
      const stringVersion = this.versionManager.parseVersionFromHeader(contentType);
      let version = null;
      if (stringVersion) {
        version = this.versionManager.getFittingVersion(stringVersion);
      }
      req[this.apiVersionKey] = version;
    };
  }
}

module.exports = {
  VersionManager,
  MiddlewareFactory
};
