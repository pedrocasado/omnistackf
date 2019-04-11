import React, { Component } from 'react'
import './styles.css'
import logo from '../../assets/logo.svg'
import { MdInsertDriveFile } from 'react-icons/md'
import api from '../../services/api'
import { distanceInWords } from 'date-fns'
import pt from 'date-fns/locale/pt'
import Dropzone from 'react-dropzone'
import socket from 'socket.io-client'

export default class Box extends Component {
    state = {
        box: {},
    }

    async componentDidMount() {
        this.subscribeToNewFiles()

        const boxId = this.props.match.params.id

        const response = await api.get(`/boxes/${boxId}`)

        this.setState({ box: response.data })
    }

    subscribeToNewFiles = () => {
        const boxId = this.props.match.params.id
        const io = socket('https://omnistackb.herokuapp.com')

        io.emit('connectRoom', boxId)

        // keep
        io.on('file', data => {
            this.setState({
                box: {
                    ...this.state.box, // clone box
                    files: [data, ...this.state.box.files], // keep files that already exists and append new one
                },
            })
        })
    }

    handleUpload = files => {
        files.forEach(file => {
            // console.log(file);

            const boxId = this.props.match.params.id

            // simulate a form to send a file
            const data = new FormData()
            data.append('file', file)

            api.post(`/boxes/${boxId}/files`, data)
        })
    }

    render() {
        return (
            <div id="box-container">
                <header>
                    <img src={logo} alt="" />
                    <h1>{this.state.box.title}</h1>
                </header>

                <Dropzone onDropAccepted={this.handleUpload}>
                    {({ getRootProps, getInputProps }) => (
                        <div
                            className="upload"
                            // copy props (same as using the attributes here)
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />
                            <p>Arraste arquivos ou clique aqui.</p>
                        </div>
                    )}
                </Dropzone>

                <ul>
                    {this.state.box.files &&
                        this.state.box.files.map(file => {
                            // console.log(file);

                            return (
                                <li key={file._id}>
                                    <a
                                        className="fileInfo"
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MdInsertDriveFile
                                            size={24}
                                            color="#A5cfff"
                                        />
                                        <strong>{file.title}</strong>
                                    </a>

                                    <span>
                                        há{' '}
                                        {distanceInWords(
                                            file.createdAt,
                                            new Date(),
                                            {
                                                locale: pt,
                                            }
                                        )}
                                    </span>
                                </li>
                            )
                        })}
                </ul>
            </div>
        )
    }
}
