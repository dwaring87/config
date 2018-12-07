'use strict';


const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');


/**
 * Configuration Manager
 * @class
 */
class Config {


  /**
   * Setup a new Configuration
   * @param {string} [defaultConfig] Absolute Path to default configuration file
   * @param {function} [parser] A function to parse the configuration properties after reading
   * @param {boolean} [replaceArrays] Set to true to replace arrays with new values
   */
  constructor(defaultConfig, parser, replaceArrays) {
    this._config = {};
    this._defaultConfig = defaultConfig;
    this._replaceArrays = replaceArrays;

    // Read the Default Config File, if provided
    if ( this._defaultConfig ) {
      this.read(this._defaultConfig, parser);
    }
  }


  /**
   * Get the Configuration
   * @returns {object}
   */
  get() {
    return this._config;
  }

  /**
   * Manually set the Configuration (replaces all existing properties)
   * @param {object} config New configuration
   */
  set(config) {
    this._config = config;
  }

  /**
   * Reset the configuration to the default values
   */
  reset() {
    this.clear();
    this.read(this._defaultConfig);
  }

  /**
   * Clear all configuration properties
   */
  clear() {
    this._config = {};
  }

  /**
   * Read the configuration file from the specified path and merge its properties
   * with the existing configuration properties
   * @param {string} location Path to the configuration file to read
   * @param {function} [parser] A function to parse the configuration properties after reading
   */
  read(location, parser) {
    if ( location ) {

      // Relative Path: relative to process cwd
      if ( Config._isRelativePath(location) ) {
        location = path.normalize(process.cwd() + '/' + location);
      }

      // Check for file existence
      if ( !fs.existsSync(location) ) {
        throw new Error('Config file at ' + location + ' does not exist');
      }

      // Read new config file
      let add = JSON.parse(fs.readFileSync(location, 'utf8'));

      // Parse relative paths relative to file location
      add = Config._parseConfig(add, path.dirname(location));

      // Parse the new config, if parser is provided
      if ( parser ) {
        add = parser(add);
      }

      // Set Array Merge Function
      let arrayMergeFunction = function (d, s) {
        return d.concat(s);
      }
      if ( this._replaceArrays ) {
        arrayMergeFunction = function(d, s) {
          return s;
        }
      }

      // Merge configs
      this._config = merge(this._config, add, {
        arrayMerge: arrayMergeFunction
      });

    }
  }





  /**
   * Parse the Configuration.  This converts any values that are
   * relative paths to absolute paths (relative to the specified directory)
   * @param {Object} object The configuration object
   * @param {string} directory The relative path root directory
   * @returns {object} a parsed configuration object
   * @private
   */
  static _parseConfig(object, directory) {
    let rtn = {};

    // Parse all of the properties in the object
    for (let property in object) {
      if (object.hasOwnProperty(property)) {
        let value = object[property];

        // If the property's value is an array, parse each child
        if ( Array.isArray(value) ) {
          let parsed = [];
          for ( let i = 0; i < value.length; i++ ) {
            let p = value[i];
            if ( typeof p === 'object' ) {
              p = Config._parseConfig(p, directory);
            }
            parsed.push(p);
          }
          rtn[property] = parsed;
        }

        // If the property's value is an object, recurse another level
        else if ( typeof value === 'object' ) {
          rtn[property] = Config._parseConfig(value, directory);
        }

        // Parse the property's value
        else {
          rtn[property] = Config._parseConfigValue(value, directory);
        }

      }
    }

    return rtn;
  }

  /**
   * Parse the configuration value (check for relative paths)
   * @param {*} value configuration value
   * @param {string} directory The directory paths are relative to
   * @returns {*} parsed configuration value
   * @private
   */
  static _parseConfigValue(value, directory) {
    if ( Config._isRelativePath(value) ) {
      value = Config._makeAbsolutePath(value, directory);
    }
    return value;
  }




  /**
   * Check if the directory is a relative path (begins with './' or '../')
   * @param {string} directory Path to directory
   * @return {boolean} True if the directory is a relative path
   * @private
   */
  static _isRelativePath(directory) {
    if ( typeof directory === 'string' ) {
      if ( directory.charAt(0) === '.' ) {
        if ( directory.charAt(1) === '/' ) {
          return true;
        }
        if ( directory.charAt(1) === '.' ) {
          if ( directory.charAt(2) === '/' ) {
            return true;
          }
        }
      }
      return false;
    }
    else {
      return false;
    }
  }


  /**
   * Change a relative path to an absolute path (relative to the specified directory)
   * @param {string} relativePath The relative path to make absolute
   * @param {string} relativePathRoot The directory to base the relative path off of
   * @returns {string} The absolute path
   * @private
   */
  static _makeAbsolutePath(relativePath, relativePathRoot) {
    return path.normalize(
      path.join(relativePathRoot, '/', relativePath)
    );
  }

}


module.exports = Config;
