export const Shaders = (color: string) => {
  const vertex = `
        [[stage(vertex)]]
        fn main([[builtin(vertex_index)]] VertexIndex: u32) -> [[builtin(position)]] vec4<f32> {
            var pos = array<vec2<f32>, 3>(
                vec2<f32>(0.0, 0.5),
                vec2<f32>(-0.5, -0.5),
                vec2<f32>(0.5, -0.5));
            return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        }
    `

  const fragment = `
        [[stage(fragment)]]
        fn main() -> [[location(0)]] vec4<f32> {
            return vec4<f32>${color};
        }`
  return { vertex, fragment }
}

export const GLSLshaderPerVertexColor = () => {
  const vertex = `
        #version 450
        const vec2 pos[3] = vec2[3](
            vec2(0.0f, 0.5f),
            vec2(-0.5f, -0.5f),
            vec2(0.5f, -0.5f)
        );

        const vec3 color[3] = vec3[3](
            vec3(1.0f, 0.0f, 0.0f),
            vec3(0.0f, 1.0f, 0.0f),
            vec3(0.0f, 0.0f, 1.0f)
        );

        layout (location = 0) out vec4 vColor;

        void main() {
            vColor = vec4(color[gl_VertexIndex], 1.0f);
            gl_Position = vec4(pos[gl_VertexIndex], 0.0f, 1.0f);
        }
    `

  const fragment = `
        #version 450
        layout (location = 0) in vec4 vColor;
        layout (location = 0) out vec4 fragColor;

        void main() {
            fragColor = vColor;
        }
    `

  return { vertex, fragment }
}

export const ShaderPerVertexColor = () => {
  const vertex = `
       struct Output {
           [[builtin(position)]] Position : vec4<f32>;
           [[location(0)]] vColor : vec4<f32>;
       };

       [[stage(vertex)]]
       fn main([[builtin(vertex_index)]]VertexIndex: u32) -> Output {
        var pos = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5)
        );

        var color = array<vec3<f32>, 3>(
            vec3<f32>(1.0, 0.0, 0.0),
            vec3<f32>(0.0, 1.0, 0.0),
            vec3<f32>(0.0, 0.0, 1.0)
        );

        var output: Output;
        output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        output.vColor = vec4<f32>(color[VertexIndex], 1.0);

        return output;
       }
    `

  const fragment = `
       [[stage(fragment)]]
       fn main([[location(0)]] vColor: vec4<f32>)->[[location(0)]]vec4<f32> {
           return vColor;
       }
    `

  return { vertex, fragment }
}

export const LinePointPrimives = () => {
  const vertex = `
    [[stage(vertex)]]
    fn main([[builtin(vertex_index)]] VertexIndex: u32) -> [[builtin(position)]]vec4<f32> {
        var pos = array<vec2<f32>, 6> (
            vec2<f32>(-0.5,  0.7),
            vec2<f32>( 0.3,  0.6),
            vec2<f32>( 0.5,  0.3),
            vec2<f32>( 0.4, -0.5),
            vec2<f32>(-0.4, -0.4),
            vec2<f32>(-0.3,  0.2)
        );

        return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    }
  `

  const fragment = `
  [[stage(fragment)]]
  fn main() -> [[location(0)]]vec4<f32> {
    return vec4<f32>(1.0, 1.0, 0.0, 1.0);
  }
  `

  return { vertex, fragment }
}

export const TriStrips = () => {
  const vertex = `
    struct Output {
      [[builtin(position)]] Position: vec4<f32>;
      [[location(0)]] vColor: vec4<f32>;
    };

    [[stage(vertex)]]
    fn main([[builtin(vertex_index)]] VertexIndex: u32) -> Output  {
      var pos : array<vec2<f32>, 9> = array<vec2<f32>, 9>(
        vec2<f32>(-0.63,  0.80),
        vec2<f32>(-0.65,  0.20),
        vec2<f32>(-0.20,  0.60),
        vec2<f32>(-0.37, -0.07),
        vec2<f32>( 0.05,  0.18),
        vec2<f32>(-0.13, -0.40),
        vec2<f32>( 0.30, -0.13),
        vec2<f32>( 0.13, -0.64),
        vec2<f32>( 0.70, -0.30)             
      );

      var colors : array<vec3<f32>, 9> = array<vec3<f32>, 9>(
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0),
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0),
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0),  
      );

      var output : Output;
      output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
      output.vColor = vec4<f32>(colors[VertexIndex], 1.0);

      return output;
    }
  `

  const fragment = `
    [[stage(fragment)]]
    fn main([[location(0)]] vColor : vec4<f32>) -> [[location(0)]] vec4<f32> {
      return vColor;
    }
  `

  return { vertex, fragment }
}

export const QuadBufferPerAttrib = () => {
  const vertex = `
    struct Output {
      [[builtin(position)]] Position: vec4<f32>;
      [[location(0)]] vColor: vec4<f32>;
    };

    [[stage(vertex)]]
    fn main([[location(0)]] pos: vec4<f32>, [[location(1)]] color: vec4<f32>) -> Output {
      var output : Output;
      output.Position = pos;
      output.vColor = color;
      
      return output;
    }
  `

  const fragment = `
  [[stage(fragment)]]
  fn main([[location(0)]] vColor : vec4<f32>) -> [[location(0)]] vec4<f32> {
    return vColor;
  }
  `

  return { vertex, fragment }
}
