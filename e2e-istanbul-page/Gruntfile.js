module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    hostname: 'localhost',
                    base: './',
                    port: 3000,
                    keepalive: true,
                    open: 'http://localhost:3000/coverage/lcov-report'
                }
            }
        },
        instrument: {
            files: 'prod/js/main.js',
            options: {
                basePath: 'prod/js/instrumented/',
                flatten: true
            }
        },
        clean: {
            dev: ['prod/']
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.*'],
                    dest: 'prod/'
                }]
            }
        },
        makeReport: {
            src: 'coverage/coverage.json',
            options: {
                type: 'lcov',
                dir: 'coverage'
            }
        },
        jsbeautifier: {
            files: ['src/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('server', ['connect']);
    grunt.registerTask('dev', ['clean', 'copy', 'instrument']);
    grunt.registerTask('report', ['makeReport', 'jsbeautifier', 'connect']);
    // grunt.registerTask('test', ['simplemocha', 'report', 'server', 'open']);
    // Need jasmine-node at global level
};