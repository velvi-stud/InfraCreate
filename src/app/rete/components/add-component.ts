import { Component, Input, Output, Node } from 'rete';
import { numSocket } from '../sockets';
import { NumControl } from '../controls/control1/number-control';
import { AngularComponent, AngularComponentData } from 'rete-angular-render-plugin';
import { MyNodeComponent1 } from './node1/node1.component';

export class AddComponent extends Component implements AngularComponent {
  
  data: AngularComponentData;

  constructor() {
    super('ELEM-1');
    this.data.render = 'angular'; 
    this.data.component = MyNodeComponent1;
  }

  // modify the node
  async builder(node) {
    const inp1 = new Input('num1', 'int1', numSocket, true);
    const inp2 = new Input('num2', 'int2', numSocket, true);
    const out = new Output('num', 'out', numSocket, true);

    inp1.addControl(new NumControl(this.editor, 'num1'));
    inp2.addControl(new NumControl(this.editor, 'num2'));

    node
      .addInput(inp1)
      .addInput(inp2)
      .addControl(new NumControl(this.editor, 'preview', true))
      .addOutput(out);
  }

  // come funziona
  worker(node, inputs, outputs) {
    // const n1 = inputs['num1'].length ? inputs['num1'][0] : node.data.num1;
    // const n2 = inputs['num2'].length ? inputs['num2'][0] : node.data.num2;
    // const sum = n1 + n2;

    // const ctrl = <NumControl> this.editor.nodes.find(n => n.id === node.id).controls.get('preview');
    // ctrl.setValue(sum);
    // outputs['num'] = sum;
  }

  created(node) {
    console.log('created', node);
  }

  destroyed(node) {
    console.log('destroyed', node);
  }
}
