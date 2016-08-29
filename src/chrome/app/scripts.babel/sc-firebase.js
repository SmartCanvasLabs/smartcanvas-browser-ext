var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.FIREBASE = (function(scUtils) {
  return {

    instance: {},
    firebaseToken: '',

    startFirebase: function(user, onChange){
      var that = this;

      that.firebaseToken = user.firebase.token;
      that.onChange = onChange;

      that.instance = new Firebase(user.firebase.firebaseURL);
      that.authFirebase(user.firebase.token);
    },

    authFirebase: function(token){
      var that = this;

      that.instance.authWithCustomToken(token, function(error, authData){
        if(error){
          console.log('Firebase Authentication Failed', error);
          scUtils.redirectToLogin();
        } else {
          console.log('Firebase Authenticated successfully with payload:', authData);
          that.addListeners(authData);
        }
      });
    },

    addListeners: function(authData){
      this.instance.child('users/' + authData.uid + '/action-card-stream').off('child_changed', this.changeListener);
      this.instance.child('users/' + authData.uid + '/foryou-card-stream').off('child_changed', this.changeListener);

      this.instance.child('users/' + authData.uid + '/action-card-stream').on('child_changed', this.changeListener, this.errorListener);
      this.instance.child('users/' + authData.uid + '/foryou-card-stream').on('child_changed', this.changeListener);
    },

    changeListener: function(v) {
      console.debug('firebase LISTENER -> ', v);
      SMARTCANVAS.FIREBASE.onChange();
    },

    errorListener: function(e){
      console.debug('firebase ERROR -> ', e);
      SMARTCANVAS.FIREBASE.authFirebase(SMARTCANVAS.FIREBASE.firebaseToken);
    }

  };

})(SMARTCANVAS.UTILS);