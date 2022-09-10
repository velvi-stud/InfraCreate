import { Component, Input, Output, Node } from 'rete';
import { _Socket } from '../../../sockets/socket';
import { _Control } from '../../../controls/control';
import { AngularComponent, AngularComponentData } from 'rete-angular-render-plugin';
import { NodeData, WorkerInputs, WorkerOutputs } from 'rete/types/core/data';
import { TheaterInternalServiceModuleInstanceComponent } from './theaterInternalServiceModuleInstance.component';
import {  reteBasicModuleInfo } from '../../reteBasic';
import { EnumModuleType } from 'src/app/models/appType';
// import { EnumModuleType } from 'src/app/rete-settings/models/reteModelType';


export class ReteTheaterInternalServiceModuleInstanceInfo extends reteBasicModuleInfo {
  type: EnumModuleType.TheaterInternalServiceModuleInstance;
}

export function getEmptyReteTheaterInternalServiceModuleInstanceInfo(): ReteTheaterInternalServiceModuleInstanceInfo {
  let x: ReteTheaterInternalServiceModuleInstanceInfo = {
    Input: [],
    Output: [],
    name: "",
    description: "",
    type: EnumModuleType.TheaterInternalServiceModuleInstance,
    host_number: 0,
    network_number: 0,
    subnet_number: 0,
    area: '',
    module: '',
    version: '',
    sequence: '',
    consumer_interfaces_link: []
  };
  return x;
}


export class TheaterInternalServiceModuleInstanceNode extends Component implements AngularComponent {

  data: AngularComponentData;

  constructor() {
    super(EnumModuleType.TheaterInternalServiceModuleInstance);
    this.data.render = 'angular';
    this.data.component = TheaterInternalServiceModuleInstanceComponent;
  }

  async builder(node: Node) {
    if (Object.keys(node.data).length === 0) // fase di design -> esista ma è node.data = {} | fase di visual data != {}
      this.createNewNode(node)
    else
      this.valorizeNode(node)
    // const out1 = new Output('num', 'Number', numSocket);
    // node.addControl(new NumControl(this.editor, 'num')).addOutput(out1);
    // node.addControl(new NumControl(this.editor, 'Altro'));
  }

  createNewNode(node: Node) {
    let t = getEmptyReteTheaterInternalServiceModuleInstanceInfo()
    node.data = {
      ...node.data,
      ...t
    }
    var i = ["port_consumer"];
    var o = ["port_provisor"];
    var il = i.length;
    var ol = o.length;

    for (let index = 0; index < il; index++) {
      var key = i[index]
      var title = i[index]
      var socket = _Socket;
      var inp = new Input(key, title, socket, true);
      node.addInput(inp);
    }

    for (let index = 0; index < ol; index++) {
      var key = o[index]
      var title = o[index]
      var socket = _Socket;
      var out = new Output(key, title, socket, true);
      node.addOutput(out);
    }
  }

  valorizeNode(node: Node) {
    var i: any = node.data['Input'];
    var o: any = node.data['Output'];
    var il = i.length;
    var ol = o.length;

    for (let index = 0; index < il; index++) {
      var key = i[index]
      var title = i[index]
      var socket = _Socket;
      var inp = new Input(key, title, socket, true);
      node.addInput(inp);
    }

    for (let index = 0; index < ol; index++) {
      var key = o[index]
      var title = o[index]
      var socket = _Socket;
      var out = new Output(key, title, socket, true);
      node.addOutput(out);
    }
  }

  worker(node: NodeData, inputs: WorkerInputs, outputs: WorkerOutputs) {
    console.log("Worker - work", node, inputs, outputs);
  }

  created(node: Node) {
    console.log('created', node);
  }

  destroyed(node: Node) {
    console.log('destroyed', node);
  }


}