export default Ember.Route.extend({
  renderTemplate: function() {
    this.render('edit-person', { controller: 'new-person' });
  },
  model: function() {
    return this.store.createRecord('person');
  },
  deactivate: function() {
    var model = this.get('controller.model');
    if (!model.get('isSaving')) {
      model.deleteRecord();
    }
  }
});
