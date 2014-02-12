/*
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var fs = require("fs"),
    hasher = require('crypto'),
    HASH_FILE_NAME = 'bundle-hashes.json',
    DEBUG_FILE_NAME = 'bundle-debug.json',
    LOCALIZATION_FILE_NAME = 'bundle-localization-strings.json';

function BundleStatsCollector(fileSystem) {

    this.FileSystem = fileSystem || fs;
    this.GenerateHash = function (fileText) {
        return hasher.createHash('md5').update(fileText).digest('hex');
    };
    this.HashCollection = { };
    this.DebugCollection = { };
    this.LocalizedStrings = { };
    this.Console = { log: function () { } };
}

exports.BundleStatsCollector = BundleStatsCollector;
exports.HASH_FILE_NAME = HASH_FILE_NAME;
exports.DEBUG_FILE_NAME = DEBUG_FILE_NAME;
exports.LOCALIZATION_FILE_NAME = LOCALIZATION_FILE_NAME;

var GetOutputFile = function (outputdirectory, filename) {
    var seperator = '/';
    if (outputdirectory[outputdirectory.length - 1] == seperator) {
        seperator = '';
    }
    return outputdirectory + seperator + filename;
}

BundleStatsCollector.prototype.LoadStatsFromDisk = function (outputdirectory) {

    var _this = this,
        loadFromDisk = function(fs, outputdirectory, fileName) {

        var ret;
        var outputFile = GetOutputFile(outputdirectory, fileName);
        try {
            var file = fs.readFileSync(outputFile, 'utf8')
            ret = JSON.parse(file);
        }
        catch (err) {
            ret = {};
        }
        return ret;
    }
    _this.HashCollection = loadFromDisk(_this.FileSystem, outputdirectory, HASH_FILE_NAME);
    _this.DebugCollection = loadFromDisk(_this.FileSystem, outputdirectory, DEBUG_FILE_NAME);
    _this.LocalizedStrings = loadFromDisk(_this.FileSystem, outputdirectory, LOCALIZATION_FILE_NAME);
};

BundleStatsCollector.prototype.SaveStatsToDisk = function (outputdirectory) {

    var _this = this,
        saveToDisk = function(fs, outputdirectory, fileName, data) {
            var outputFile = GetOutputFile(outputdirectory, fileName);
            fs.writeFileSync(outputFile, JSON.stringify(data, null, 4))
        };

    saveToDisk(_this.FileSystem, outputdirectory, HASH_FILE_NAME, _this.HashCollection);
    saveToDisk(_this.FileSystem, outputdirectory, DEBUG_FILE_NAME, _this.DebugCollection);
    saveToDisk(_this.FileSystem, outputdirectory, LOCALIZATION_FILE_NAME, _this.LocalizedStrings);
}

BundleStatsCollector.prototype.AddFileHash = function (bundleName, bundleContents) {

    var _this = this;
    var hash = _this.GenerateHash(bundleContents),
        bundleShortName = bundleName.split('/').pop();

    _this.HashCollection[bundleShortName] = hash;
}

BundleStatsCollector.prototype.ClearDebugFiles = function(bundleName) {

    var _this = this,
        bundleShortName = bundleName.split('/').pop();

    if(_this.DebugCollection[bundleShortName])
    {
        _this.DebugCollection[bundleShortName] = [];
    }
};

BundleStatsCollector.prototype.AddDebugFile = function (bundleName, fileName) {
    
    var _this = this,
        bundleShortName = bundleName.split('/').pop();

    if(!_this.DebugCollection[bundleShortName])
    {
        _this.DebugCollection[bundleShortName] = [];
    }

    if(_this.DebugCollection[bundleShortName].indexOf(fileName) < 0) {
        _this.DebugCollection[bundleShortName].push(fileName);
    }
}


BundleStatsCollector.prototype.ClearLocalizedStrings = function(bundleName) {

    var _this = this,
        bundleShortName = bundleName.split('/').pop();

    if(_this.LocalizedStrings[bundleShortName])
    {
        _this.LocalizedStrings[bundleShortName] = [];
    }
};

BundleStatsCollector.prototype.AddLocalizedString = function (bundleName, localizedString) {

    var _this = this,
        bundleShortName = bundleName.split('/').pop();

    if(!_this.LocalizedStrings[bundleShortName])
    {
        _this.LocalizedStrings[bundleShortName] = [];
    }

    if(_this.LocalizedStrings[bundleShortName].indexOf(localizedString) < 0) {
        _this.LocalizedStrings[bundleShortName].push(localizedString);
    }
}