const project_graph_1 = require('@nx/workspace/src/core/project-graph');
const file_utils_1 = require('@nx/workspace/src/core/file-utils');
const shared_1 = require('@nx/workspace/src/command-line/shared');
const affected_project_graph_1 = require('@nx/workspace/src/core/affected-project-graph');
const handlebars_1 = require('handlebars');
const fs_1 = require('fs');
const projectGraph = project_graph_1.createProjectGraph();
const fileChanges = file_utils_1.calculateFileChanges(
  shared_1.parseFiles({ base: 'master' }).files,
  undefined
);
const affectedGraph = affected_project_graph_1.filterAffected(
  projectGraph,
  fileChanges
);
const projects = affectedGraph.nodes;
const librariesTemplate = handlebars_1.compile(
  fs_1.readFileSync('.library.gitlab-ci.yml.handlebars').toString('utf-8')
);
const librariesCI = librariesTemplate({ projects: Object.values(projects) });
fs_1.writeFileSync('.library.gitlab-ci.yml', librariesCI);
