var gulp = require('gulp');
var del = require('del');
var exec = require('child_process').exec;
var path = require('path');

var paths = {
	build: 'D:\\Seyyedi\\Code\\Seyyedi.RemoteMpc\\bin',
	app: 'D:\\Seyyedi\\Applications\\Seyyedi.RemoteMpc',
	msbuild: 'C:\\Program Files (x86)\\MSBuild\\14.0\\Bin\\MSBuild.exe'
};

gulp.task('default', ['build']);

gulp.task('clean-build', function() {
	return del([
		path.join(paths.build, '*')
	]);
});

gulp.task('clean-app', function() {
	return del([
		path.join(paths.app, '*')
	], {force: true});
});

gulp.task('build', function(cb) {
	exec('"' + paths.msbuild + '" /nologo /v:quiet /p:Configuration=Release Seyyedi.RemoteMpc.csproj', function(err, stdout, stderr) {
		if (err) {
			console.log(stdout);
		}

		cb(err);
	});
});

gulp.task('rebuild', ['clean-build', 'build']);

gulp.task('deploy', ['rebuild', 'clean-app'], function() {
	return gulp
		.src(path.join(paths.build, 'Release', '**', '*'))
		.pipe(gulp.dest(paths.app));
});