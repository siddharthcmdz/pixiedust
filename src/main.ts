import $ from 'jquery';
import { CheckWebGPU } from "./helper";

// const isWebGPUsupported = CheckWebGPU()
// const wgpuh2 = document.getElementById('id-gpu-check')
// if(wgpuh2) {
//    wgpuh2.innerHTML = isWebGPUsupported
// }
$('#id-gpu-check').html(CheckWebGPU());