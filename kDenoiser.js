// ---------- kDenoiser Script ----------
// tryna be best denoiser for PixInsight
// part of • kScript Bundle •
// made with love by Igor Koprowicz (koperson)
// check my other scripts at https://www.kscripts.pl/
// --------------------------------------

#feature-id kScripts Bundle > kDenoiser
#feature-info Image denoiser script
#define TITLE "kDenoiser"
#define VERSION "0.2.1"

#include <pjsr/NumericControl.jsh>
#include <pjsr/Sizer.jsh>

var scriptVersion = "0.2.1";

var DenoiseParameters = {
  dnAmount: 0,
  targetView: undefined,
  colorDen: 0
};

function applyDenoise(view, value) {
  var P = new TGVDenoise;
  P.strengthL = value;
  P.smoothnessL = 3;
  if (view != undefined){
    P.executeOn(view);
  }
}

function colorDenoise(view) {
  var PCE = new ChannelExtraction;
  PCE.colorSpace = ChannelExtraction.prototype.RGB;
  PCE.channels = [ // enabled, id
     [true, "R"],
     [true, "G"],
     [true, "B"]
  ];
  PCE.sampleFormat = ChannelExtraction.prototype.SameAsSource;
  PCE.inheritAstrometricSolution = true;
  PCE.executeOn(view);

  var PLRGB = new LRGBCombination;
  PLRGB.channels = [ // enabled, id, k
     [true, "R", 1.00000],
     [true, "G", 1.00000],
     [true, "B", 1.00000],
     [false, "", 1.00000]
  ];
  PLRGB.mL = 0.500;
  PLRGB.mc = 0.500;
  PLRGB.clipHighlights = true;
  PLRGB.noiseReduction = true;
  PLRGB.layersRemoved = 4;
  PLRGB.layersProtected = 2;
  PLRGB.inheritAstrometricSolution = true;
  PLRGB.executeOn(view);

  var Rview = View.viewById("R");
  var Gview = View.viewById("G");
  var Bview = View.viewById("B");

  if (Rview != null) Rview.window.close();
  if (Gview != null) Gview.window.close();
  if (Bview != null) Bview.window.close();

}

Console.noteln("Successfully loaded kDenoiser v", scriptVersion, "!<br>");

function kdDialog() {
  this.__base__ = Dialog;
  this.__base__();

  // scaling
  this.scaledMinWidth = 400;

  // textbox
  this.title = new TextBox(this);
  this.title.text = "<b>kDenoiser</b>" + " v"+ scriptVersion + "<br>" +
                    "Script that <b>gently</b> denoise your image <b>without damaging details</b>!<br><br>" +
                    "Slider applies only for TGVDenoise, and doesn't change anything to Color Denoise.<br><br>" +
                    "<b><i>What's new? </b><b>Version 0.2.1</b><br>- Added <b>Color Denoise</b> option.<br>- Fixed errors.</i>";
  this.title.readOnly = true;
  this.title.minHeight = 160;
  this.title.maxHeight = 200;
  this.title.windowTitle = "kDenoiser";

  // viewlist
  this.viewList = new ViewList(this);
  this.viewList.getMainViews();
  this.viewList.onViewSelected = function(view){
    DenoiseParameters.targetView = view;
  }

  // control
  this.amount = new NumericControl(this);
  this.amount.label.text = "Strength (0.0 = off)";
  this.amount.setPrecision(1);
  this.amount.setRange(0, 10);
  this.amount.slider.setRange(0, 100);
  this.amount.onValueUpdated = function( value ) {
    DenoiseParameters.dnAmount = value;
  }

  // checkbox (for color denoise)
  this.cdError = new Error(this);
  this.checkBox = new CheckBox(this);
  this.checkBox.text = "Color denoise?";
  this.checkBox.checked = false;
  this.checkBox.onClick = function (checked) {
    DenoiseParameters.colorDen = 1;
  };

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
  this.bottomSizer.add(this.checkBox);

  // sizer
  this.sizer = new VerticalSizer();
  this.sizer.add(this.title);
  this.sizer.addSpacing(8);
  this.sizer.add(this.viewList);
  this.sizer.addSpacing(8);
  this.sizer.add(this.amount);
  this.sizer.addSpacing(15);
  this.sizer.add(this.checkBox);
  this.sizer.addSpacing(25);
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
  Console.show();

  if(retVal == 1){
    if(DenoiseParameters.targetView == undefined){
      Console.criticalln("!!! You need to choose a view !!!")
    } else {
      if (DenoiseParameters.dnAmount == 0){
        if (DenoiseParameters.colorDen == 1){
          Console.hide();
          colorDenoise(DenoiseParameters.targetView);
      }
    } else {
      applyDenoise(DenoiseParameters.targetView, DenoiseParameters.dnAmount);
    }
      Console.noteln("Successfully denoised!");
    }
  } else {
    Console.criticalln("Canceled denoising.");
  }
}
main();
