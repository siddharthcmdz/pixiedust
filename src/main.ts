import $ from 'jquery';
import { CheckWebGPU } from "./helper";
import { Shaders, ShaderPerVertexColor } from './shaders';
// const isWebGPUsupported = CheckWebGPU()
// const wgpuh2 = document.getElementById('id-gpu-check')
// if(wgpuh2) {
//    wgpuh2.innerHTML = isWebGPUsupported
// }
// $('#id-gpu-check').html(CheckWebGPU());

const CreateTriangle = async (color='(1.0,1.0,1.0,1.0)') => {
    const checkgpu = CheckWebGPU()
    if(checkgpu.includes('Your current browser does not support WebGPU!')) {
        console.log(checkgpu)
        throw('Your current browser does not support webgpu')
    }

    const canvas = document.getElementById('c') as HTMLCanvasElement
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter
    const device = await adapter?.requestDevice() as GPUDevice
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext

    const format = 'bgra8unorm'
    context.configure({
        device: device,
        format: format,
    })

    //const shader = Shaders(color)
    const shader = ShaderPerVertexColor()

    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: shader.vertex
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: shader.fragment
            }),
            entryPoint: 'main',
            targets: [{
                format: format as GPUTextureFormat
            }]
        },
        primitive: {
            topology: 'triangle-list'
        }
    })

    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            loadValue: {r: 0.5, g: 0.5, b: 0.8, a: 1.0},
            storeOp: 'store'
        }]
    });
    renderPass.setPipeline(pipeline)
    renderPass.draw(3, 1, 0, 0)
    renderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
}

$( document ).ready(function() {
    console.log( "ready!" );
    CreateTriangle()
});


// $('#id-btn').on('click', ()=>{
//     const color = $('#id-color').val() as string
//     CreateTriangle(color)
// })