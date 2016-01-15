var testDirectory = 'recompile-js-test-suite';
var integrationTest = require('./helpers/jasmine-wrapper.js');
var test = new integrationTest.Test(integrationTest.TestType.Js, testDirectory);

test.describeIntegrationTest("Recompile Js Tests - ", function() {

    beforeEach(function () {
        test.given.OutputDirectoryIs('output-dir');
        test.given.BundleOption('-outputbundlestats');
        test.given.FileToBundle("file1.js", "var foo = 'asdf';");
        test.given.FileToBundle("file2.js", "var foo2 = 'bnmf';");
        test.given.FileToBundle("mustache1.mustache", "<div>{{a}}</div>");

        test.actions.Bundle();

        test.assert.verifyBundleIs(
            ';var foo="asdf";\n' +
            ';var foo2="bnmf";\n' +
            ';window.JST=window.JST||{},JST.mustache1=new Hogan.Template({code:function(a,i,n){var e=this;return e.b(n=n||""),e.b("<div>"),e.b(e.v(e.f("a",a,i,0))),e.b("</div>"),e.fl()},partials:{},subs:{}});\n'
        );

    });

    it("An updated javascript file causes the contents of the bundle to change when re-bundled.", function () {

        test.given.UpdatedFile("file2.js", "var foo2 = 'a new value';");

        test.actions.Bundle();

        test.assert.verifyBundleIs(
            ';var foo="asdf";\n' +
            ';var foo2="a new value";\n' +
            ';window.JST=window.JST||{},JST.mustache1=new Hogan.Template({code:function(a,i,n){var e=this;return e.b(n=n||""),e.b("<div>"),e.b(e.v(e.f("a",a,i,0))),e.b("</div>"),e.fl()},partials:{},subs:{}});\n'
        );

    });

    it("An updated mustache file causes the contents of the bundle to change when re-bundled.", function () {

        test.given.UpdatedFile("mustache1.mustache", "<a>{{b}}</a>");

        test.actions.Bundle();

        test.assert.verifyBundleIs(
            ';var foo="asdf";\n' +
            ';var foo2="bnmf";\n' +
            ';window.JST=window.JST||{},JST.mustache1=new Hogan.Template({code:function(a,n,b){var e=this;return e.b(b=b||""),e.b("<a>"),e.b(e.v(e.f("b",a,n,0))),e.b("</a>"),e.fl()},partials:{},subs:{}});\n'
        );

    });
});
