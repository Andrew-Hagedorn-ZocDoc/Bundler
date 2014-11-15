
describe("Recompile Tests - ", function() {

    var exec = require('child_process').exec,
         fs = require('fs'),
         testHelper = require('./helpers/integration-test-helper.js'),
         givensHelper = require('./helpers/integration-givens.js'),
         actionsHelper = require('./helpers/integration-actions.js'),
         assertsHelper = require('./helpers/integration-asserts.js'),
         testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
         given = new givensHelper.Givens(testUtility),
         asserts,
         actions,
         bundle,
         testDirBase = 'recompile-test-suite';

    beforeEach(function () {
        given.CleanTestSpace(testDirBase);
        given.OutputDirectoryIs('output-dir');
        given.BundleOption('-outputbundlestats');
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    
    describe("Javascript: ", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'js');
            asserts = new assertsHelper.Asserts(testUtility, given, 'js');

            given.FileToBundle("file1.js", "var foo = 'asdf';");
            given.FileToBundle("file2.js", "var foo2 = 'bnmf';");
            given.FileToBundle("mustache1.mustache", "<div>{{a}}</div>");

            actions.Bundle();

            asserts.verifyBundleIs(';var foo="asdf"\n'
                         + ';var foo2="bnmf"\n'
                         + ';window.JST=window.JST||{},JST.mustache1=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div>"),d.b(d.v(d.f("a",a,b,0))),d.b("</div>"),d.fl()},partials:{},subs:{}})\n');

        });

        it("An updated javascript file causes the contents of the bundle to change when re-bundled.", function () {

            given.UpdatedFile("file2.js", "var foo2 = 'a new value';");

            actions.Bundle();

            asserts.verifyBundleIs(';var foo="asdf"\n'
                         + ';var foo2="a new value"\n'
                         + ';window.JST=window.JST||{},JST.mustache1=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div>"),d.b(d.v(d.f("a",a,b,0))),d.b("</div>"),d.fl()},partials:{},subs:{}})\n');

        });

        it("An updated mustache file causes the contents of the bundle to change when re-bundled.", function () {

            given.UpdatedFile("mustache1.mustache", "<a>{{b}}</a>");

            actions.Bundle();

            asserts.verifyBundleIs(';var foo="asdf"\n'
                         + ';var foo2="bnmf"\n'
                         + ';window.JST=window.JST||{},JST.mustache1=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<a>"),d.b(d.v(d.f("b",a,b,0))),d.b("</a>"),d.fl()},partials:{},subs:{}})\n');

        });

    });

    
    describe("Css: ", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'css');
            asserts = new assertsHelper.Asserts(testUtility, given, 'css');

            given.ImportFile("import1.less", "@import url('./import2.less');\n @imported1: black;");
            given.ImportFile("import2.less", "@imported2: black;");
            given.FileToBundle("file1.css", ".style1 { color: red; }");
            given.FileToBundle("file2.css", ".style2 { color: blue; }");
            given.FileToBundle("less1.less", "@theColor: white; .style3 { color: @theColor; }");
            given.FileToBundle("less2.less", "@import url('../import/import1.less');\n .importColor { color: @imported1; }");
            given.FileToBundle("less3.less", "@import url('../import/import1.less');\n .deeperImportColor { color: @imported2; }");

            actions.Bundle();

            asserts.verifyBundleIs('.style1{color:red}\n'
                         + '.style2{color:#00f}\n'
                         + '.style3{color:#fff}\n'
                         + '.importColor{color:#000}\n'
                         + '.deeperImportColor{color:#000}\n');

        });
        
        it("An updated css file causes the contents of the bundle to change when re-bundled.", function () {

            given.UpdatedFile("file1.css", ".newstyle1 { color: yellow; }");

            actions.Bundle();

            asserts.verifyBundleIs('.newstyle1{color:#ff0}\n'
                         + '.style2{color:#00f}\n'
                         + '.style3{color:#fff}\n'
                         + '.importColor{color:#000}\n'
                         + '.deeperImportColor{color:#000}\n');
        });

        it("An updated less file causes the contents of the bundle to change when re-bundled.", function () {

            given.UpdatedFile("less1.less", "@theColor: green; .style4 { color: @theColor; }");

            actions.Bundle();

            asserts.verifyBundleIs('.style1{color:red}\n'
                         + '.style2{color:#00f}\n'
                         + '.style4{color:green}\n'
                         + '.importColor{color:#000}\n'
                         + '.deeperImportColor{color:#000}\n');

        });
        
        it("An updated import of a less file causes the contents of the bundle to change when re-bundled.", function () {

            given.UpdatedImport("import1.less", "@import url('./import2.less');\n @imported1: blue;");

            actions.Bundle();

            asserts.verifyBundleIs('.style1{color:red}\n'
                         + '.style2{color:#00f}\n'
                         + '.style3{color:#fff}\n'
                         + '.importColor{color:#00f}\n'
                         + '.deeperImportColor{color:#000}\n');

        });

        it("An updated nested import of a less file causes the contents of the bundle to change when re-bundled.", function () {

            given.UpdatedImport("import2.less", "@imported2: blue;");

            actions.Bundle();

            asserts.verifyBundleIs('.style1{color:red}\n'
                         + '.style2{color:#00f}\n'
                         + '.style3{color:#fff}\n'
                         + '.importColor{color:#000}\n'
                         + '.deeperImportColor{color:#00f}\n');

        });
    });
});
