/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function (registry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./src/extension_impl'); }, {});
  // generator-phovea:begin

  registry.push('actionFunction', 'targidCreateView', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'createViewImpl'
  });
  registry.push('actionFunction', 'targidRemoveView', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'removeViewImpl'
  });
  registry.push('actionFunction', 'targidReplaceView', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'replaceViewImpl'
  });
  registry.push('actionFunction', 'targidSetSelection', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'setSelectionImpl'
  });

  registry.push('actionCompressor', 'targidCreateRemoveCompressor', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'compressCreateRemove',
    'matches': '(targidCreateView|targidRemoveView|targidReplaceView)'
  });

  registry.push('actionCompressor', 'targidCompressSetSelection', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'compressSetSelection',
    'matches': '(targidSetSelection)'
  });

  registry.push('ordinoStartMenuSection', 'targid_temporary_session', function () {
    return import('./src/menu/internal/TemporarySessionSection');
  }, {
    name: 'Temporary Sessions',
    cssClass: 'tdpSessionTemporaryData',
    priority: 90
  });

  registry.push('ordinoStartMenuSection', 'targid_persistent_session', function () {
    return import('./src/menu/internal/PersistentSessionSection');
  }, {
    name: 'Persistent Sessions',
    cssClass: 'tdpSessionPersistentData',
    priority: 95
  });

  registry.push('ordinoWelcomeView', 'ordinoWelcomeView', function() { return import('./src/WelcomeView'); }, {
    priority: 10
  });
  // generator-phovea:end
};

