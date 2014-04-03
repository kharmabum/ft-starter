module.exports = function(grunt) {
  grunt.registerTask('expressServer', function(target) {
    var done = this.async();
    require('../server/server')(target);
    if (!this.flags.keepalive) { done(); }
  });
};
