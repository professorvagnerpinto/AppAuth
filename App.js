/**
 * Vídeo #13 ao #18: AppAuth - Módulo 12 - Requisições, Web Services e Banco de Dados - B7Web
 * Exemplo de App utlizando o serviço Auth do Firebase.
 * Obs.: Para instalar as dependências do Firebase utilize o assistente da IDE, ou digite no terminal da IDE 'npm install firebase --save'.
 * by: Vagner Pinto
 */

import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, Button, FlatList} from 'react-native';
import firebase from 'firebase'; //deve instalar a dependência no projeto com npm --save firebase

export default class AppFirebase extends Component{

    constructor(props){
        super(props);
        this.state={
            nome:"",
            email:"",
            senha:"",
            lista:[],
            novasenha:''
        };
        this.operacao='';

    //códigos de acesso aos serviços do Firebase
    const firebaseConfig = {
        /*
            Coloque aqui as credenciais do teu projeto no Firebase.
         */

    };
    //inicializa o serviço
    if (!firebase.apps.length) { //antes testa se ele já não foi iniciado
        firebase.initializeApp(firebaseConfig);
    }

    firebase.auth().signOut(); //desloga quem estiver na sessão
    //escuta o serviço de autenticação para saber o estado atual do usuário
    firebase.auth().onAuthStateChanged( (user) => {
        if(user){
            if(this.operacao == 'signin'){
                this.operacao='';
                firebase.database().ref('users').child(user.uid).once('value')
                    .then( (snapshot) => {
                        alert('Seja bem vido(a), ' + snapshot.val().nome);
                    });
            }else if(this.operacao == 'signup') {
                this.operacao='';
                firebase.database().ref('users').child(user.uid)
                    .set({
                        nome:this.state.nome,
                        email:this.state.email
                    });
            }else if(this.operacao == 'updatePassword'){
                this.operacao='';
                let novaSenha = this.state.novaSenha;
                user.updatePassword(novaSenha)
                    .then( () => {
                        alert('Senha alterada com sucesso.');
                    })
                    .catch( (error) => {
                        alert(error.message);
                    });
            }
            this.buscarTarefas(user);
       }else{
           console.log('Usuário não logado.');
       }
    });

    //faz o bind do comportamemto com o componente
    this.cadastrarUsuario = this.cadastrarUsuario.bind(this);
    this.logar = this.logar.bind(this);
    this.buscarTarefas = this.buscarTarefas.bind(this);
    this.trocarSenha = this.trocarSenha.bind(this);

    }

    cadastrarUsuario(){
        this.operacao = 'signup';
        firebase.auth().signOut(); //desloga quem estiver na sessão
        if(this.state.nome.length == 0){
            alert('Preencha o campo nome.');
        }else{
            firebase.auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.senha)
                .then(() => {})
                .catch((error) => {
                    console.log(error.code + " " + error.message);
                    switch (error.code) {
                        case 'auth/weak-password':
                            alert('Sua senha deve conter o mínimo de 6 caracteres.');
                            break;
                        case 'auth/email-already-in-use':
                            alert('Email já cadastrado.');
                            break;
                        default:
                            alert('Erro! Verefique sua internet e tente novamente. Ou contate o suporte técnico.');
                    }
                });
        }
    }

    logar(){
        if(this.operacao != 'updatePassword'){
            this.operacao = 'signin';
        }
        firebase.auth().signOut(); //desloga quem estiver na sessão
        firebase.auth()
            .signInWithEmailAndPassword(this.state.email, this.state.senha)
            .then(() => {})
            .catch((error) => {
                switch(error.code){
                    case 'auth/wrong-password':
                        alert('Senha incorreta.');
                        break;
                    case 'auth/user-not-found':
                        alert('Usuário não cadastrado.');
                        break;
                    default:
                        if(this.state.email.length == 0 || this.state.senha.length == 0 ){
                            alert('Preencha todos os campos.');
                        }else{
                            alert('Erro! Verefique sua internet e tente novamente. Ou contate o suporte técnico.');
                        }
                }
            });
    }

    trocarSenha(){
        this.operacao = 'updatePassword';
        this.logar();
    }

    buscarTarefas(user){
        firebase.database().ref('tarefas').child(user.uid)
            .on('value', (snapshot)=> {
                let s = this.state;
                s.lista = [];
                snapshot.forEach((child) => {
                    s.lista.push({
                        key: child.key,
                        tarefa: child.val()
                    });
                })
                this.setState(s);
            });
    }

    render(){
        return (
            <View style={styles.body}>
                <Text>Nome completo:</Text>
                <TextInput style={styles.input} onChangeText={(nome)=>this.setState({nome})} />
                <Text>Email:</Text>
                <TextInput style={styles.input} onChangeText={(email)=>this.setState({email})} />
                <Text>Senha:</Text>
                <TextInput secureTextEntry={true} style={styles.input} onChangeText={(senha)=>{this.setState({senha})}} />
                <Text>Nova senha:</Text>
                <TextInput secureTextEntry={true} style={styles.input} onChangeText={(novaSenha)=>{this.setState({novaSenha})}} />
                <Button title="Cadastrar" style={styles.button} onPress={this.cadastrarUsuario} />
                <Button title={"Logar"} style={styles.button} onPress={this.logar} />
                <Button title={"Trocar Senha"} style={styles.button} onPress={this.trocarSenha} />
                <FlatList style={styles.list}
                          data={this.state.lista}
                          renderItem={({item})=>{
                              return(
                                  <View>
                                      <Text style={styles.text}>{item.tarefa}</Text>
                                  </View>
                              );
                          }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    body:{
        margin:10
    },
    input:{
        height:40,
        borderWidth:1,
        borderColor:'#FF0000',
        marginBottom:5
    },
    button:{
        margin:20
    },
    list:{
        marginTop:20,
        margin:10
    },
    text:{
        fontSize:16,
        fontWeight:'bold'
    }
});
