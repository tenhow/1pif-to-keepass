/* jshint node: true */

'use strict';

var _             = require('lodash');
var fs            = require('fs');
var path          = require('path');
var util          = require('util');
var events        = require('events');
var xmldom        = require('xmldom');
var jsonStream    = require('./lib/json-stream');
var dataHandler   = require('./lib/data-handler');
var endHandler    = require('./lib/end-handler');
var DOMParser     = xmldom.DOMParser;
var XMLSerializer = xmldom.XMLSerializer;

var defaults = {
  output: process.stdout
};

var OnePassConverter = function OnePassConverter(input, options) {

  this.input       = input;
  this.options     = _.assign(defaults, options);
  this.inputStream = fs.createReadStream(this.input);
  this.entries     = {};
  this.xmlParser   = new DOMParser();
  this.serializer  = new XMLSerializer();

  events.EventEmitter.call(this);
};

util.inherits(OnePassConverter, events.EventEmitter);

OnePassConverter.prototype.start = function() {
  this.emit('start', this.input, this.options);

  fs.readFile(path.join(__dirname, 'xml-starter.xml'), _.bind(function(xml) {
    this.xml        = this.xmlParser.parseFromString(xml.toString());
    this.jsonStream = jsonStream(this.inputStream)
      .on('data', _.bind(dataHandler, this))
      .on('end', _.bind(endHandler, this));
  }, this));

  return true;
};

module.exports = OnePassConverter;
