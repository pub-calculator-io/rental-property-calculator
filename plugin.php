<?php
/*
Plugin Name: CI Rental property calculator
Plugin URI: https://www.calculator.io/rental-property-calculator/
Description: Free rental property calculator that uses the formula NPV = [CF^1 / (1 + R^1)] - PC. A rental ROI calculator that helps analyze and compare investment rental properties.
Version: 1.0.0
Author: Calculator.io
Author URI: https://www.calculator.io/
License: GPLv2 or later
Text Domain: ci_rental_property_calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Rental Property Calculator by Calculator.iO";

function display_ci_rental_property_calculator(){
    $page = 'index.html';
    return '<h2><img src="' . esc_url(plugins_url('assets/images/icon-48.png', __FILE__ )) . '" width="48" height="48">Rental Property Calculator</h2><div><iframe style="background:transparent; overflow: scroll" src="' . esc_url(plugins_url($page, __FILE__ )) . '" width="100%" frameBorder="0" allowtransparency="true" onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + \'px\';" id="ci_rental_property_calculator_iframe"></iframe></div>';
}

add_shortcode( 'ci_rental_property_calculator', 'display_ci_rental_property_calculator' );