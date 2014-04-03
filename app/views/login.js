export default Ember.View.extend({
  willDestroyElement: function() {
    this.get('context').set('errorMessage', null);
  }
});
