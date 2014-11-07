var fileNameStats = require('../../bundle-stats.js');

describe("Bundle Stats - ", function() {

    var fileName = 'c:\\src\\styles\\area1\\less1.less',
        import1 = 'c:\\src\\styles\\imports\\fullPathImport.less',
        import2 = 'c:\\src\\styles\\imports\\fullPathImport2.less',
        import3 = 'c:\\src\\styles\\imports\\fullPathImport3.less',
        stats,
        fileSystem,
        result,
        lastUpdated,
        importUpdated;

  beforeEach(function () {

      fileSystem = {
          statSync: function () {
              return {
                mtime: {
                      getTime: function() {
                          return importUpdated;
                      }
                    }
                }
          }
      };

      spyOn(fileSystem, 'statSync').andCallThrough();

      stats = new fileNameStats.BundleStatsCollector(fileSystem);
      stats.LessImports = {};

      lastUpdated = importUpdated = 12;
  });

 describe("ChangeExistsInImportedFile: ", function() {

     it("given no imports for file, returns false", function(){

         givenNoImports();

         changeExistsInImportedFile();

         verifyChangeExistsIs(false);
     });

     it("given no imports for file, does not hit the file system", function(){

         givenNoImports();

         changeExistsInImportedFile();

         verifyFileSystemNotHit();
     });

     it("given imports for file and imports never seen, hits filesystem for each import", function(){

         givenImports();

         changeExistsInImportedFile();

         verifyFileSystemHit();
     });

     it("given no imports for file, returns false", function(){

         givenNoImports();

         changeExistsInImportedFile();

         verifyChangeExistsIs(false);
     });

     it("given imports for file and no changes in any import, returns false", function(){

         givenImports();

         changeExistsInImportedFile();

         verifyChangeExistsIs(false);
     });

     it("given imports for file and change in an import, returns true", function(){

         givenImports();
         givenChangeInImport();

         changeExistsInImportedFile();

         verifyChangeExistsIs(true);
     });

     it("given already seen imports for file and change in an import, returns true", function(){

         givenImports();
         givenImportsAlreadySeen();

         changeExistsInImportedFile();

         verifyChangeExistsIs(true);
     });

     it("given already seen imports for file and change in an import, does not hit the file system", function(){

         givenImports();
         givenImportsAlreadySeen();

         changeExistsInImportedFile();

         verifyFileSystemNotHit();
     });

     var changeExistsInImportedFile = function() {
        result = stats.ChangeExistsInImportedFile(fileName, lastUpdated);
     };

     var verifyFileSystemHit = function() {
         expect(fileSystem.statSync).toHaveBeenCalledWith(import1);
         expect(fileSystem.statSync).toHaveBeenCalledWith(import2);
         expect(fileSystem.statSync).toHaveBeenCalledWith(import3);
     }

     var verifyChangeExistsIs = function(foundAChange) {
         expect(result).toBe(foundAChange);
     };

     var verifyFileSystemNotHit = function() {
        expect(fileSystem.statSync).not.toHaveBeenCalled();
     };

     var givenChangeInImport = function() {
         importUpdated = 13;
     };

     var givenNoImports = function() {
         stats.LessImports[fileName] = null;
     };

     var givenImports = function() {
         stats.LessImports[fileName] = [ import1, import2, import3 ]
     };

     var givenImportsAlreadySeen = function() {
         stats.ImportedFileStatus[import1] = false;
         stats.ImportedFileStatus[import2] = false;
         stats.ImportedFileStatus[import3] = true;
     }


 });
});