/**
 * PDF Extraction Setup Tests
 */

describe('PDF Extraction Setup', () => {
  const projectRoot = process.cwd();

  describe('Directory Structure', () => {
    it('should have docs/pdfs directory', () => {
      const fs = require('fs');
      const path = require('path');
      const pdfDir = path.join(projectRoot, 'docs', 'pdfs');
      expect(fs.existsSync(pdfDir)).toBe(true);
    });

    it('should have docs/pdfs/processed directory', () => {
      const fs = require('fs');
      const path = require('path');
      const processedDir = path.join(projectRoot, 'docs', 'pdfs', 'processed');
      expect(fs.existsSync(processedDir)).toBe(true);
    });
  });

  describe('Dependencies', () => {
    it('should have pdf-parse installed', () => {
      const path = require('path');
      const packageJson = require(path.join(process.cwd(), 'package.json'));
      expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('pdf-parse');
    });
  });

  describe('Scripts', () => {
    it('should have extract-knowledge script', () => {
      const path = require('path');
      const packageJson = require(path.join(process.cwd(), 'package.json'));
      expect(packageJson.scripts).toHaveProperty('extract-knowledge');
    });

    it('should have extract-knowledge:dry script', () => {
      const path = require('path');
      const packageJson = require(path.join(process.cwd(), 'package.json'));
      expect(packageJson.scripts).toHaveProperty('extract-knowledge:dry');
    });
  });
});
