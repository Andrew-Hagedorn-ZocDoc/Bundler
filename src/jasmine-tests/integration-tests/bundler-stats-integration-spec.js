
describe("Integration Tests for Bundle Stats Collecting:", function() {

    var exec = require('child_process').exec,
        fs = require('fs'),
        testHelper = require('./helpers/integration-test-helper.js'),
        givensHelper = require('./helpers/integration-givens.js'),
        actionsHelper = require('./helpers/integration-actions.js'),
        assertsHelper = require('./helpers/integration-asserts.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        given = new givensHelper.Givens(testUtility),
        actions = new actionsHelper.Actions(testUtility, given, 'js'),
        asserts = new assertsHelper.Asserts(testUtility, given, 'js'),
        testDirBase = 'stats-test-suite';

    beforeEach(function () {

        given.CleanTestSpace(testDirBase);
        given.OutputDirectoryIs('output-dir');
        given.FileToBundle('file1.js',    'var file1 = "file1";');
        given.FileToBundle('file2.js',    'var file2 = "file2";');
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    describe("Hashing: ", function() {

        it(" hashes not computed if the option is not specified.", function () {

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.OutputDirectory, 'bundle-hashes.json');
        });

        it("The stats option computes a hash for all bundles and puts it in the output directory.", function () {

            given.BundleOption('-outputbundlestats');

            actions.Bundle();


            asserts.verifyJson(
                given.OutputDirectory,
                'bundle-hashes.json',
                function (json) {

                    var properties = Object.getOwnPropertyNames(json);
                    expect(properties.length).toBe(1);
                    expect(properties[0]).toBe('test.js');
                    expect(json['test.js']).toBe("1f293fa2bbd662c1c4ef9780550867a7");
                });
        });
    });

    describe("Debug Files: ", function () {

        it("No debug files are computed if the option is not specified.", function () {

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.OutputDirectory, 'bundle-debug.json');
        });

        it("The stats option computes a collection of files for all bundles and puts it in the output directory.", function () {

            given.BundleOption('-outputbundlestats');

            actions.Bundle();

            asserts.verifyJson(
                given.OutputDirectory,
                'bundle-debug.json',
                function (json) {
                    validateJsonObject(json, function (b) {
                        expect(b.indexOf('stats-test-suite\\test\\file1.js') >= 0).toBe(true);
                        expect(b.indexOf('stats-test-suite\\test\\file2.js') >= 0).toBe(true);
                    });
                });
        });
    });

    describe("Localization Files: ", function () {

        it("No localization files are computed if the option is not specified.", function () {
            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.OutputDirectory, 'bundle-localization-strings.json');
        });

        it("The stats option computes a set of localized strings for all bundles and puts it in the output directory.", function () {

            given.BundleOption('-outputbundlestats');

            given.FileToBundle('file3.js', "// @localize js1.string\ni18n.t('js2.string');\ni18n.t(\"js3.string\");");
            given.FileToBundle('file4.mustache', "{{# i18n }}js4.string{{/ i18n }}");
            given.FileToBundle('file5.mustache', "{{# i18n }}js5.string{{/ i18n }}");

            actions.Bundle();

            asserts.verifyJson(
                given.OutputDirectory,
                'bundle-localization-strings.json',
                function (json) {
                    validateJsonObject(json, function (b) {
                        expect(b.indexOf('js1.string') >= 0).toBe(true);
                        expect(b.indexOf('js2.string') >= 0).toBe(true);
                        expect(b.indexOf('js3.string') >= 0).toBe(true);
                        expect(b.indexOf('js4.string') >= 0).toBe(true);
                        expect(b.indexOf('js5.string') >= 0).toBe(true);
                    });
                });
        });
    });

    describe("Ab Config Files: ", function () {

        it("No ab config files are computed if the option is not specified.", function () {
            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.OutputDirectory, 'bundle-ab-configs.json');
        });

        it("The stats option computes a set of localized strings for all bundles and puts it in the output directory.", function () {
            given.BundleOption('-outputbundlestats');

            given.FileToBundle('file3.js', "{AB.isOn('ab.config.1');}\nvar x=12;i18n.t('ab.config.2');");
            given.FileToBundle('file4.js', "AB.isOn('ab.config.3');");

            actions.Bundle();

            asserts.verifyJson(
                given.OutputDirectory,
                'bundle-ab-configs.json',
                function (json) {
                    validateJsonObject(json, function (b) {
                        expect(b.indexOf('ab.config.1') >= 0).toBe(true);
                        expect(b.indexOf('ab.config.3') >= 0).toBe(true);
                        expect(b.indexOf('ab.config.2') >= 0).toBe(false);
                    });
                });
        });
    });

    var validateJsonObject = function (json, validateBundleFunc) {
        var properties = Object.getOwnPropertyNames(json);
        expect(properties.length).toBe(1);
        expect(properties[0]).toBe('test.js.bundle');
        validateBundleFunc(json['test.js.bundle']);
    };

});
