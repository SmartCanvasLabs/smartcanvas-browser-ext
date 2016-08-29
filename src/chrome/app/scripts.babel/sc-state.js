var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.STATE = (function() {
  return {

    extensionState: 'OK',

    isExtensionStateOK: function(){
      if(this.extensionState === 'OK'){
        return true;
      }else{
        return false;
      }
    },

    setExtensionState: function(state){
      this.extensionState = state;
    }

  };

})();