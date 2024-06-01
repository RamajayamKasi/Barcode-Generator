var page_width = document.documentElement.clientWidth;
var page_height = document.documentElement.clientHeight;
var barcode_type_length = {
  CODE39: 43,
  CODE128: 0,
  EAN13: 12,
  EAN8: 8,
  EAN5: 5,
  EAN2: 2,
  UPC: 12,
  ITF14: 13,
  ITF: 0,
  MSI: 0,
  MSI10: 0,
  MSI1010: 0,
  MSI1011: 0,
};
var width = "50%",
  barcode_width = 4,
  barcode_height = 100,
  barcode_text_size = 30;
// Based on the width we can change the barcode styles and width
if (page_width > 600 && page_width < 1024) {
  width = "80%";
  barcode_width = 3;
  barcode_height = 80;
  barcode_text_size = 20;
} else if (page_width < 600) {
  width = "95%";
  barcode_width = 2;
  barcode_height = 50;
  barcode_text_size = 15;
}
// Set width for the sub conatoner
$("#barcode_subcontainer").css("width", width);
// Generate the barcode
$(document).on("click", "#btn_generate_barcode", function (e) {
  let barcode_type = $("#barcode_create_type").val();
  let barcode_type_format = $("#barcode_type").val().trim();
  let barcode_data = $("#barcode_data");
  let number_of_barcode = $.trim($("#number_of_barcode").val());
  let barcode_svg_id = "";
  let barcode_svg_content = "";
  let add_comma = "";
  let i = 0;
  let barcode_length_value = barcode_type_length[barcode_type_format];
  let barcode_data_value = "";
  $("#barcode_type").css("border", "2px solid gray");
  $("#barcode_data").css("border", "2px solid gray");
  $("#number_of_barcode").css("border", "2px solid gray");
  if (barcode_type == "") {
    $("#barcode_create_type").css("border", "2px solid red");
    swal.fire({
      icon: "error",
      text: "Please select the barcode create type.",
      allowOutsideClick: false,
    });
  } else if (barcode_type_format == "") {
    $("#barcode_type").css("border", "2px solid red");
    swal.fire({
      icon: "error",
      text: "Please select the barcode type.",
      allowOutsideClick: false,
    });
  } else if (barcode_data.val().trim() == "" && barcode_type == "new") {
    barcode_data.css("border", "2px solid red");
    swal.fire({
      icon: "error",
      text: "Please enter the barcode information.",
      allowOutsideClick: false,
    });
  } else if (
    barcode_length_value != 0 &&
    (barcode_length_value < barcode_data.val().length ||
      barcode_length_value > barcode_data.val().length) &&
    barcode_type != "random"
  ) {
    barcode_data.css("border", "2px solid red");
    swal.fire({
      icon: "error",
      text:
        "The barcode type " +
        barcode_type_format +
        " max length is " +
        barcode_length_value +
        ".",
      allowOutsideClick: false,
    });
  } else if (number_of_barcode == "") {
    $("#number_of_barcode").css("border", "2px solid red");
    swal.fire({
      icon: "error",
      text: "Please enter the number of barcode.",
      allowOutsideClick: false,
    });
  } else if (number_of_barcode < 1) {
    $("#number_of_barcode").val(1);
    swal.fire({
      icon: "error",
      text: "Please enter the number of barcode.",
      allowOutsideClick: false,
    });
  } else {
    if (number_of_barcode > 0) {
      for (i = 0; i < number_of_barcode; i++) {
        add_comma = i === 0 ? "" : ",";
        barcode_svg_id += add_comma + "#barcode" + i;
        barcode_svg_content += '<svg id="barcode' + i + '"></svg>';
      }
      $("#barcodeImage").html(barcode_svg_content);
    }

    for (i = 0; i < number_of_barcode; i++) {
      if (barcode_type == "random") {
        if (barcode_length_value == 0 || barcode_type_format == "CODE39") {
          barcode_length_value = 10;
        }
        barcode_data_value = generate_random_number(barcode_length_value);
        if (barcode_type_format == "EAN13") {
          const checkDigit = calculateCheckDigit(barcode_data_value);
          barcode_data_value = barcode_data_value + checkDigit;
        }
        console.log(barcode_data_value);
      } else {
        barcode_data_value = $.trim(barcode_data.val());
      }
      try {
        if (barcode_type_format == "EAN13") {
          const checkDigit = calculateCheckDigit(barcode_data_value);
          barcode_data_value = barcode_data_value + checkDigit;
        }
        JsBarcode("#barcode" + i, barcode_data_value, {
          fontSize: barcode_text_size,
          width: barcode_width,
          height: barcode_height,
          format: barcode_type_format,
        });
      } catch (error) {
        // console.log(error, barcode_type_format);
        swal
          .fire({
            icon: "info",
            text: "Somthing went wrong. Please try again.",
          })
          .then((result) => {
            $("#btn_back").trigger("click");
          });
      }
    }
    let change_title = barcode_type == "new" ? "" : "Random";
    $(
      "#btn_new_barcode,#btn_random_barcode,.barcode_value_field,#btn_generate_barcode,#btn_reset_field,.barcode_format_note"
    ).hide();
    $("#btn_download_pdf,#btn_download_image,#barcode,#btn_back").show();
    $("#barcode_title").text(change_title + " Barcode Generated Successfully");
  }
});

// Download barcode in pdf and image
$(document).on("click", "#btn_download_pdf,#btn_download_image", function (e) {
  let barcode_download_type = $(this).attr("barcode_download_type");
  let barcode_name = $.trim($("#barcode_name").val());
  barcode_name = barcode_name == "" ? "barcode" : barcode_name;
  let barcode_content = document.getElementById("barcodeImage");
  if (barcode_download_type == "pdf") {
    try {
      let printWindow = window.open("", "_blank");
      printWindow.document.write(
        "<html><head><title>Print Barcode</title></head><body><h1>Barcode Generated Code</h1>"
      );
      printWindow.document.write(barcode_content.outerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      document.write("NO");
    }
  } else {
    swal
      .fire({
        icon: "warning",
        text: "Download image format",
        confirmButtonText: "PNG",
        denyButtonText: "SVG",
        showCancelButton: false,
        showDenyButton: true,
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          convert_svg_to_png(barcode_name + ".png");
        } else if (result.isDenied) {
          var barcode_image = $("#barcodeImage svg");
          for (i = 0; i < barcode_image.length; i++) {
            // Convert the SVG element to a base64 string
            let svgBase64 =
              "data:image/svg+xml;base64," + btoa(barcode_image[i].outerHTML);
            download_barcode(svgBase64, barcode_name + ".svg");
          }
        }
      });
  }
});

// Convert svg to png format
function convert_svg_to_png(filename) {
  var barcode_image = $("#barcodeImage svg");
  for (i = 0; i < barcode_image.length; i++) {
    // Select the SVG element by its ID
    var svgElement = barcode_image[i]; // Assuming your SVG element has the ID "barcode"

    // Encode the SVG data to base64
    var svgBase64 = btoa(new XMLSerializer().serializeToString(svgElement));

    // Create a new Image element
    var img = new Image();

    // When the Image has loaded
    img.onload = function () {
      // Create a new Canvas element
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      // Get the 2D context of the canvas
      var ctx = canvas.getContext("2d");

      // Improve image quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.webkitImageSmoothingEnabled = true;
      ctx.mozImageSmoothingEnabled = true;

      // Draw the Image onto the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Get the base64 PNG representation of the canvas with higher quality
      var pngBase64 = canvas.toDataURL("image/png");
      download_barcode(pngBase64, filename);
    };

    // Set the source of the Image element to the SVG data
    img.src = "data:image/svg+xml;base64," + svgBase64;
  }
}

// Using url download the image
function download_barcode(src, filename) {
  // Create a download link for the PNG image
  var downloadLink = document.createElement("a");
  downloadLink.href = src;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Back to barcode generate
$(document).on("click", "#btn_back", function (e) {
  let step = $(this).attr("step");
  $("#barcode_data").val("");
  $(
    ".barcode_value_field,#btn_generate_barcode,#btn_reset_field,.barcode_format_note"
  ).show();
  $("#btn_download_pdf,#btn_download_image,#barcode,#btn_back").hide();
  $("#barcode_title").text("Generate Barcode");
  $("#barcodeImage").html("");
  $("#barcode_data").css("border", "2px solid gray");
});

//Number of barcode input field validation
$(document).on("change keyup", "#number_of_barcode", function (e) {
  let value = $.trim($(this).val());
  if (value > 0 || value == "") {
    $(this).val(
      value.replaceAll("-", "").replaceAll("e", "").replaceAll(".", "")
    );
  } else {
    $(this).val(1);
  }
});

// reset the field
$(document).on("click", "#btn_reset_field", function (e) {
  $("#barcode_type,#barcode_name,#barcode_data,#barcode_create_type").val("");
  $("#number_of_barcode").val(1);
  $("#barcodeImage,.barcode_format_note ").html("");
  $(".barcode_format_note").hide();
  $("#barcode_name").parent().hide();
});

// show and hide the information field
$(document).on("change", "#barcode_create_type", function (e) {
  let value = $(this).val();
  if (value == "new") {
    $("#barcode_data").parent().show();
  } else {
    $("#barcode_data").parent().hide();
  }
});

// based on the type display the notes
$(document).on("change", "#barcode_type", function (e) {
  let value = $(this).val();
  if (value != "") {
    $(".barcode_format_note").show();
    $(".barcode_format_note").html(barcode_type_details[value]);
    if (barcode_type_length[value] != 0) {
      $("#barcode_data").attr("maxlength", barcode_type_length[value]);
    }
    $("#barcode_name").val($("#barcode_type option:selected").text());
  } else {
    $("#barcode_format_note").hide();
    $(".barcode_format_note ").html("");
  }
});

function calculateCheckDigit(number) {
  const digits = number.split("").map(Number);
  let sum = 0;

  // Sum odd-positioned digits and even-positioned digits with weight 3
  for (let i = 0; i < digits.length; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      sum += digits[i] * 3;
    }
  }

  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

function generate_random_number(number_length) {
  let add_num = "1",
    multi_num = "9";
  if (number_length != 0 && number_length > 1) {
    for (i = 1; i < number_length; i++) {
      add_num += "0";
      multi_num += "0";
    }
    if (parseInt(add_num.length) > 1 && parseInt(multi_num.length) > 1) {
      return Math.floor(
        parseInt(add_num) + Math.random() * parseInt(multi_num)
      );
    } else {
      swal.fire({
        icon: "info",
        text: "Somthing went wrong. Please try again.",
        allowOutsideClick: false,
      });
      return;
    }
  }
}
