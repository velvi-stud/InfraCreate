import React from 'react';
import { Handle } from 'react-flow-renderer';
import "../node.css";


const node_temp = (tipo1, style1, img1, css_in1, css_out1, valid_connection_in, valid_connection_out) => {

	const tipo = tipo1;
	const style = style1;
	const imagins = img1;
	const css_in = css_in1;
	const css_out = css_out1;
	const isValidConnectionIn = valid_connection_in;
	const isValidConnectionOut = valid_connection_out;
	//console.log(tipo);

	const generate_custom_node = ({ data }) => {
		//console.log('node '+tipo+' created');
		let w = 70;
		let h = 70;
		if (tipo === 'port') {
			w = 40;
			h = 40;
		}
		return (
			<div style={style}>

				{/* PORTA INGRESSO TIPO 1 -> TARGET*/}
				<Handle
					//id={data.label}
					type="target"
					position="left"
					style={css_in}
					isValidConnection={isValidConnectionIn} //per verificare l'interconnessionne con altri nodi
				/>

				{/* NOME */}
				<div className='unselectable'> <b> {data.label} </b></div>

				{/* IMMAGINE */}
				<img src={imagins} width={w} height={h} alt="picgra" />

				{/* Description */}
				<div> <p  className='unselectable' style={{ marginBottom: '0' }}> {data.description} </p> </div>

				{/* PORTA USCITA TIPO 1*/}
				<Handle
					//id={data.label}
					type="source"
					position="right"
					style={css_out}
					isValidConnection={isValidConnectionOut}
				/>
			</div>
		)
	};

	return (generate_custom_node);

}
export default node_temp;
