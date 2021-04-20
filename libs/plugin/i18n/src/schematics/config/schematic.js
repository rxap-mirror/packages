"use strict";
exports.__esModule = true;
var schematics_1 = require("@angular-devkit/schematics");
var workspace_1 = require("@nrwl/workspace");
function default_1(options) {
    return function () {
        return schematics_1.chain([
            workspace_1.updateWorkspace(function (workspace) {
                var project = workspace.projects.get(options.project);
                if (!project) {
                    throw new Error('Could not extract target project.');
                }
                if (project.targets.has('pack')) {
                }
                else {
                    var targets = [];
                    if (project.targets.has('build')) {
                        var buildTarget = project.targets.get('build');
                        if (buildTarget.configurations && buildTarget.configurations['production']) {
                            targets.push(options.project + ":build:production");
                        }
                        else {
                            targets.push(options.project + ":build");
                        }
                    }
                    project.targets.add({
                        name: 'pack',
                        builder: '@rxap-plugin/pack:build',
                        options: { targets: targets }
                    });
                }
            })
        ]);
    };
}
exports["default"] = default_1;
