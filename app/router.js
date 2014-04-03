var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.route('login');
  this.route('logout');
  this.route('signup');
  this.route('people');
  this.route('protected');
  this.resource('person', { path: '/people/:person_id' });
  this.route('edit-person', { path: '/people/:person_id/edit' });
  this.route('new-person', { path: '/people/new' });
});

export default Router;
