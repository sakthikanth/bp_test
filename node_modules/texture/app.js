#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    shell = require('shelljs');

if (!shell.which('pdflatex')) {
  console.log('pdflatex required!');
  return;
}

var fileName = path.normalize(process.argv[2]),
    filePath = path.resolve(process.cwd(), fileName),
    extension = fileName.slice(fileName.length-3,fileName.length),
    genericPath = filePath.slice(0, filePath.length - 4);

if (extension !== "tex") {
  console.log(".tex file required!");
  return;
}

shell.exec("while true; do sleep 1; if [ " + genericPath +
            ".tex -nt " + genericPath +
            ".log ]; then pdflatex -halt-on-error " + genericPath +
            ".tex; fi; done");
