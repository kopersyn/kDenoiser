// ***kDenoiser Script***
// tryna be best denoiser for pixinsight
// made with love by Igor Koprowicz (koperson)
// check my other scripts at https://www.kscripts.pl/

#feature-id kScripts > kDenoiser
#feature-info Image denoiser script

#include <pjsr/NumericControl.jsh>
#include <pjsr/Sizer.jsh>

var scriptVersion = "0.1";

var DenoiseParameters = {
  dnAmount: 0,
  targetView: undefined,
  smvalue: 0
};

function applyDenoise(view, value) {
  var P = new TGVDenoise;
  P.strengthL = value + 5;
  P.executeOn(view);
}

Console.show();
Console.noteln("Successfully loaded kDenoiser!");
Console.noteln("Script version: ", scriptVersion);

function kdDialog() {
  this.__base__ = Dialog;
  this.__base__();

  // scaling
  this.scaledMinWidth = 400;

  // textbox
  this.title = new TextBox(this);
  this.title.text = "<b>kDenoiser</b>" + " v"+ scriptVersion + "<br><br>" +
                    "Script that <b>gently</b> denoise your image <b>without damaging details</b>!";
  this.title.readOnly = true;
  this.title.minHeight = 80
  this.title.maxHeight = 80;

  // viewlist
  this.viewList = new ViewList(this);
  this.viewList.getMainViews();
  this.viewList.onViewSelected = function(view){
    DenoiseParameters.targetView = view;
  }

  // control
  this.amount = new NumericControl(this);
  this.amount.label.text = "Denoise strength";
  this.amount.setPrecision(2);
  this.amount.setRange(0, 1);
  this.amount.slider.setRange(0, 100);
  this.amount.onValueUpdated = function( value ) {
    DenoiseParameters.dnAmount = value;
  }

  // execute
  this.executeButton = new PushButton(this);
  this.executeButton.text = "Execute";
  this.executeButton.witdh = 40;
  this.executeButton.onClick = () => {
    this.ok();
  }


  // bottom sizer
  this.bottomSizer = new HorizontalSizer;
  this.bottomSizer.margin = 6;
  this.bottomSizer.addStretch();
  this.bottomSizer.add(this.executeButton);

  // sizer
  this.sizer = new VerticalSizer();
  this.sizer.add(this.title);
  this.sizer.addSpacing(8);
  this.sizer.add(this.viewList);
  this.sizer.addSpacing(8);
  this.sizer.add(this.amount);
  this.sizer.addSpacing(12);
  this.sizer.add(this.executeButton);
  this.sizer.margin = 20;
  this.sizer.addStretch();

}

kdDialog.prototype = new Dialog;

function showDialog() {
  let dialog = new kdDialog;
  return dialog.execute();
}

function main() {
  let retVal = showDialog();

  if(retVal == 1){
    applyDenoise(DenoiseParameters.targetView ,DenoiseParameters.dnAmount);
    Console.noteln("Successfully denoised!");
  } else {
    Console.critical("Canceled denoising.")
  }
}
main();
