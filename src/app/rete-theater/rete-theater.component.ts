import { Component, AfterViewInit, ViewChild, ElementRef, Input, Output as outcore, ChangeDetectionStrategy, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NodeEditor, Engine, Output, Connection } from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import ConnectionPathPlugin from 'rete-connection-path-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import { AngularRenderPlugin } from 'rete-angular-render-plugin';
import AreaPlugin from 'rete-area-plugin';
import MinimapPlugin from 'rete-minimap-plugin';
import AutoArrangePlugin from 'rete-auto-arrange-plugin'

import { NodeTheaterComponent } from './components/node-theater-component';

import { NgxSpinnerService } from "ngx-spinner";
import { NgxTypeaheadModule } from "ngx-typeahead";


@Component({
  selector: 'app-rete',
  templateUrl: './rete-theater.component.html',
  styleUrls:  ['./rete-theater.component.css'],
})

export class ReteTheaterComponent implements AfterViewInit {

  @ViewChild('nodeEditor', { static: true }) el: ElementRef;

  @Input() modules: any;
  @Input() theater: any;
  @Input() type: any; //per teatro e moduli

  container = null;
  editor: NodeEditor = null;
  components = null;
  engine = null;

  // for html dynamic part
  showside: boolean = true;
  hidemoduleinfo: boolean = false;
  hidetheaterinfo: boolean = false;
  @outcore() nodeselected: any = {};

  // variabili per input-research
  nodetofind: string = '';
  namelist = [];

  //for map bool
  ismapvisible: boolean = true;

  // to download
  downloadJsonHref: SafeUrl;

  //tab
  activetab = 1;

  constructor(private spinner: NgxSpinnerService, private render: Renderer2, private sanitizer: DomSanitizer) {
  }

  async ngAfterViewInit() {

    await this.spinner.show()
      .then(
        async () => {
          await this.delay(1000);
          // console.log("start 3")
          await this.StartApp();
        }
      )
      .then(
        async () => {
          // console.log("start 5")
          await this.spinner.hide();
        }
      )



  }


  async StartApp() {

    console.log("data passed: ", this.theater, this.modules);

    // console.log("start 4");

    this.container = this.el.nativeElement;

    // stored all node-types
    this.components = [
      new NodeTheaterComponent(),
    ];

    this.editor = new NodeEditor('demo@0.2.0', this.container);
    /* https://github.com/retejs/connection-path-plugin */
    this.editor.use(ConnectionPlugin);
    /* DECOMMENTARE SE SI NECESSITA DELLE CURVATURE DELLE CONNESSINI AD ANGOLO */
    // this.editor.use(ConnectionPathPlugin, {
    //   //  transformer: () => ([x1, y1, x2, y2]) => [[x1, y1], [(x1+x2)/2, y1], [(x1+x2)/2, y2], [x2, y2]],
    //   // transformer: () => ([x1, y1, x2, y2]) => [[x1, y1],[x2, y2]],
    //   // curve: ConnectionPathPlugin.curveLinear
    //   curve: ConnectionPathPlugin.curveBundle
    // });
    this.editor.use(AngularRenderPlugin)//, { component: MyNodeComponent });
    this.editor.use(MinimapPlugin);
    this.editor.use(ContextMenuPlugin, {
      searchBar: false,
      components: {},
      items: {
        "Dump JSON": () => {
          this.printjson();
        },
        "Get nodes": () => {
          this.getNodes();
        }
      },
      allocate(component) {
        return null;
      },
      // rename(component) {
      //   return component.name;
      // }
    });
    this.editor.use(AreaPlugin, {
      background: false, //righe
      snap: false,
      scaleExtent: { min: 0.1, max: 1 },
      translateExtent: { width: 5000, height: 4000 }
    })
    this.editor.use(AutoArrangePlugin, {
      // snap: {size: 64, dynamic: true},
      margin: { x: 400, y: 100 },
      depth: 0,
      vertical: false,
    })

    var _this = this;
    this.editor.on("nodeselected", (node) => { });
    this.editor.on('rendernode', ({ el, node }) => {
      el.addEventListener('dblclick', async () => {
        let title: string = node["data"]["title"].toString();
        // _this.showhidemoduleinfo(this.modules[title]);
        _this.hidemoduleinfo = !_this.hidemoduleinfo;
        _this.nodeselected = _this.modules[title];
        // TODO: VEDERE A NODO SELEZIONATO IL CAMPIO COLORE
        // let conn: Connection[] = node.getConnections();
        // conn.forEach(element => {
        //   console.log("--->",element,element.data);
        // });
        AreaPlugin.zoomAt(_this.editor, _this.editor.selected.list);
        const { area, container } = this.editor.view; // read from Vue component data;
        area.translate(area.transform.x - 200, area.transform.y);
      });
    });

    // TODO: CONTROLLARE L'UNSELECTING
    this.editor.on("click", ({e,container}) => { 
      // console.log(e);
      // console.log("before unselect:",this.editor.selected.list);
      // this.editor.selected.list.forEach(element => {
      //   this.editor.selected.remove(element); 
      // });
      // console.log("after unselect:",this.editor.selected.list);
    });

    this.engine = new Engine('demo@0.2.0');

    this.components.map(c => {
      this.editor.register(c);
      this.engine.register(c);
    });

    this.editor.on("connectioncreated", connection => {
      setInterval(() => {
        let node = connection.output.node;
        this.editor.view.updateConnections({ node });
      }, 1);
    });

    // this.editor.on("connectioncreated", async connection => {
    //   let nodeO = connection.output.node;
    //   let nodeI = connection.input.node;
    //   await nodeI.update();
    //   this.editor.view.updateConnections({ node:nodeI })
    //   await nodeO.update();
    //   this.editor.view.updateConnections({ node:nodeO })
    // });


    if (this.type !== undefined && this.type === 1) {
      this.showside = false;
      await this.stresstest(20);
    }
    else {
      await this.addNodes();
    }



    // this.editor.on(
    //   [
    //     'process',
    //     'nodecreated',
    //     'noderemoved',
    //     'connectioncreated',
    //     'connectionremoved'
    //   ],
    //   (
    //     async () => {
    //       await this.engine.abort();
    //       await this.engine.process(this.editor.toJSON());
    //     }
    //   ) as any
    // );


    this.editor.view.resize();
    this.editor.trigger('process');

    // to arrange all nodes
    this.editor.nodes.forEach(node => {
      this.editor.trigger("arrange", { node: node });
    });

    AreaPlugin.zoomAt(this.editor, this.editor.nodes);
    this.editor.on('zoom', ({ source }) => {
      return source !== 'dblclick';
    });

  }





  public async addNodes() {

    var nodes = [];
    await Promise.all(
      Object.entries(this.modules).map(async ([key, value]) => {
        var v = value["for_retejs"];
        // v["MD"] = value["module_details"];
        nodes[key] = await this.components[0].createNode(v);
        this.namelist.push(key);// creare array dei nomi dei nodi (utile per gli hint dell'imput-ricerca)
      })
    );

    console.log(nodes);

    Object.entries(nodes).map(async ([key, value]) => {
      this.editor.addNode(value);
    })

    /*
          // // DATA info-node
          // var infon1 = { title: "node-type2", Output: 2, Input: 3 }
          // var infon2 = { title: "node-type3", Output: ["output0", "output1", "output2"], Input: ["intput0", "input1", "input2"], type: 'Server' }
          // var infon3 = { title: "node-type3-1", Output: ["output0", "output1", "output2"], Input: ["intput0", "input1", "input2"], type: 'port' }
          // // var infon3 = { title:"node-type1", Output:4, Input:9 }
    
          // // Component creation (foreach module)
          // const n1 = await this.components[0].createNode(infon1);
          // const n2 = await this.components[0].createNode(infon2);
          // const n3 = await this.components[0].createNode(infon3);
          // const n4 = await this.components[2].createNode({ title: "nodotipo3" });
    
    
          // const aa = await this.components[0].createNode(this.modules["Lab_1_in_1"]["for_retejs"]);
          // this.editor.addNode(aa);
    
          // /*
          // //insert name
          // // n1.data['title'] = "nodotipo1";
          // // n2.data['title'] = "nodotipo2";
          // // n3.data['title'] = "nodotipo3";
    
          // // n1.position = [80, 200];
          // // n2.position = [80, 400];
          // // n3.position = [500, 240];
          // /
    
          // // Insert into editor
          // this.editor.addNode(n1);
          // this.editor.addNode(n2);
          // this.editor.addNode(n3);
          // this.editor.addNode(n4);

          // // Create connection
          // this.editor.connect(n2.outputs.get('output0'), n4.inputs.get('num2'));
          // this.editor.connect(n2.outputs.get('output1'), n3.inputs.get('input1'));
          // this.editor.connect(n1.outputs.get('output1'), n4.inputs.get('num1'));
          // this.editor.connect(n3.outputs.get('output1'), n4.inputs.get('num2'));
    */

    // DECOMMENTARE SE NON VANNO I COLLEGAMENTI
    // Sempre prima che avvengano i collegamenti 
    //Necessario per il path delle connessioni (altrimenti si fottono)
    // this.editor.on("connectioncreated", connection => {
    //   setInterval(() => {
    //     let node = connection.output.node;
    //     this.editor.view.updateConnections({ node });
    //   }, 1);
    // });

    Object.entries(this.theater["for_retejs"]["module_connection"]).map(async ([key, value]) => {
      try {
        if (nodes[value["to"]] !== undefined && nodes[value["from"]] !== undefined) {
          this.editor.connect(nodes[value["to"]].outputs.get(value["port_dst"]), nodes[value["from"]].inputs.get(value["port_src"]));
        }
      } catch (e) {
        console.log(
          "PROBLEM: ", e, "\ntry",
          " connect ",
          value["from"], " port ", value["port_src"], " data: ", nodes[value["from"]],
          " to ",
          value["to"], " port ", value["port_dst"], " data: ", nodes[value["to"]],
        );
        // console.log(e);
      }
    })


  }


  public showhidemoduleinfo(node) {
    /* DA UTILIZZARE QUANDO SI CAPISCE COME EFFETTUARE IL REFRESH DEL CANVAS */
    /* USARE SERVICES PER PASSAGGIO DI DATI */
    // if (this.nodeselected === undefined) {
    //   var x = {};
    //   x["canvas_info"] = node;
    //   x["data"] = this.modules[node["title"]];
    //   this.nodeselected = x;
    //   this.hidemoduleinfo = true;
    //   return;
    // }

    // if (this.hidemoduleinfo && this.nodeselected.canvas_info.title !== node.title) {
    //   this.nodeselected["canvas_info"] = node;
    //   this.nodeselected["data"] = this.modules[node["title"]];
    // }
    // else if (!this.hidemoduleinfo) {
    //   this.hidemoduleinfo = true;
    //   this.nodeselected["canvas_info"] = node;
    //   this.nodeselected["data"] = this.modules[node["title"]];
    // }
    // else {
    //   this.hidemoduleinfo = false;
    // }
    /**/
    this.hidemoduleinfo = !this.hidemoduleinfo;
    this.nodeselected["data"] = node;
    console.log("node -> ", this.nodeselected);

  }

  public showhidetheaterinfo() {
    this.hidetheaterinfo = !this.hidetheaterinfo;
  }

  public makezoom(k) {
    // k is declarend in (click) ad +- 0.1
    const { area, container } = this.editor.view; // read from Vue component data;
    const rect = area.el.getBoundingClientRect();
    const ox = (rect.left - container.clientWidth / 2) * k;
    const oy = (rect.top - container.clientHeight / 2) * k;
    area.zoom(area.transform.k + k, ox, oy, 'wheel');
  }

  public showallcomponent() {
    AreaPlugin.zoomAt(this.editor, this.editor.nodes);
  }

  public findElement(result) {
    this.nodetofind = result;
    console.log("finding ", this.nodetofind);

    let elementfound = this.editor.nodes.find(n => n["data"]["title"] === this.nodetofind)
    let elementpick = new Array(elementfound); // deve necessariamente trovarsi in un array...

    AreaPlugin.zoomAt(this.editor, elementpick);
    this.editor.selectNode(elementpick[0]);
  }

  public removeminimap() {
    var z = document.getElementsByClassName("minimap")[0];
    z.removeAttribute("style");
    if (this.ismapvisible) {
      z.setAttribute("style", "visibility: hidden;");
    }
    else {
      z.setAttribute("style", "visibility: visible;");
    }
    this.ismapvisible = !this.ismapvisible

  }

  public downloadJSON() {
    var theJSON = JSON.stringify(this.editor.toJSON());
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadJsonHref = uri;
  }

  public async arrangenodes() {
    this.editor.nodes.forEach(async node => {
      await node.update()
      this.editor.trigger("arrange", { node: node });
    });
  }

  public activatetab(num) {
    for (var i = 1; i <= 3; i++) {
      var x = "a" + i;
      var el = document.getElementById(x);
      // console.log("-->",x,el);
      if (i === num) {
        this.activetab = num;
        el.setAttribute("aria-selected", "true");
        el.classList.add("active");
      }
      else {
        el.setAttribute("aria-selected", "false");
        el.classList.remove("active");
      }
    }

  }

  public printjson() {
    console.log(this.editor.toJSON());
    console.log(JSON.stringify(this.editor.toJSON()));
  }

  public getNodes(): Object[] {
    var x = this.editor.toJSON();
    var z = [];
    for (let key in x) {
      let value = x[key];
      console.log(value);
      z.push(value);
    }
    return z;
  }

  public async stresstest(num: number) {

    this.editor.on("connectioncreated", connection => {
      setInterval(() => {
        let node = connection.output.node;
        this.editor.view.updateConnections({ node });
      }, 1);
    });

    var a_node = [];
    for (let index = 0; index < num; index++) {
      var info = { title: "node-name->" + index.toString(), Output: ["output0", "output1", "output2"], Input: ["intput0", "input1", "input2"], type: 'Server' }
      a_node[index] = await this.components[0].createNode(info);
    }

    for (let index = 0; index < num; index++) {
      this.editor.addNode(a_node[index]);
    }

    // this.editor.on("connectioncreated", connection => {
    //   setInterval(() => {
    //     let node = connection.output.node;
    //     this.editor.view.updateConnections({ node });
    //   }, 1);
    // });

    for (let index = 1; index < a_node.length; index++) {
      var element1 = a_node[index];
      var element0 = a_node[index - 1];
      this.editor.connect(element1.outputs.get('output1'), element0.inputs.get('input1'));
    }

  }

  public delay(ms: number) {
    // console.log("start -> delay");
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}