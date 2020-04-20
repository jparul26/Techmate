import React, { Fragment, useMemo, useState, useCallback } from "react";
import { createEditor,Editor, Transforms } from 'slate'
import { Slate, Editable, withReact,useSlate } from 'slate-react'
import { Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import { withHistory } from 'slate-history'
import isHotkey from 'is-hotkey'
import Moment from 'react-moment';
import axios from 'axios';
import { TextField} from '@material-ui/core';
import { ArrowBackIos} from '@material-ui/icons';

import './textEditor.css';
import { Button, Icon, Toolbar } from './componets'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']


const AddPost = () => {
  const [doubt, setDoubt] = useState(null);
  const [post, setPost] = useState(null);
  const [category, setCategory] = useState("Other");
  const [value, setValue] = useState(initialValue)
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  
  const onChange = e => 
  {
    setDoubt(e.target.value);
    console.log(doubt)
  }

  const onSubmit = async e =>{
      e.preventDefault();
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const description=value;
      const body = JSON.stringify({  doubt, category, description });
      console.log(body);
      try {
        const res = await axios.post(`/forum/`, body, config);
        console.log(res.data);
        setPost(res.data)
        console.log(res.data.description);
      } catch (error) {
          console.log(error);
      }
      
  }
  
  
  return post === null ? (
    <div style={{marginTop:"100px" ,marginLeft:"3%", marginRight:"3%", padding:"3% 3%", textAlign:"center"}}>
    <h1>ADD POST </h1>
         <form className='form' onSubmit={e => onSubmit(e)}>
             <div style={{marginTop:"30px"}}><h5 style={{textAlign:"left", letterSpacing:"2px"}}>Short Query:</h5>
                         <TextField
                         variant="outlined"
                         fullWidth
                         type="text"
                         label="Doubt"
                         value={doubt}
                         name="doubt"
                         onChange={e => onChange(e)}
          
                         required
                        />
                    </div>

                    <div style={{marginTop:"30px"}}><h5 style={{textAlign:"left", letterSpacing:"2px"}}>Select A Category</h5>
                     <span class="select">
                     <select  name="slct" id="slct" value={category} onChange={e=>{setCategory(e.currentTarget.value); console.log(category)} }>
                      <option selected disabled>Choose an option</option>
                      <option value="Competitive Programming" >Competitive Programming</option>
                      <option value="Other">Other</option>
                      </select>
                    </span> 
                    </div>
  
    <div style={{marginTop:"30px"}}><h5 style={{textAlign:"left", letterSpacing:"2px"}}>Describe your query</h5>
    <div style={{color:"white", background:"#2c3e50"}}>
       <Slate editor={editor} value={value} onChange={value => {setValue(value) ;console.log(value)}}>
       <div style={{marginTop:"5px" , paddingTop:"5px"}}>
      <Toolbar>
        <MarkButton format="bold" icon="Bold" />
        <MarkButton format="italic" icon="Itaclic" />
        <MarkButton format="underline" icon="Underline" />
        <MarkButton format="code" icon="Code" />
        <BlockButton format="heading-one" icon="H1" />
        <BlockButton format="heading-two" icon="H2" />
        <BlockButton format="numbered-list" icon="Ordered List" />
        <BlockButton format="bulleted-list" icon="Unordered List" />
      </Toolbar>
      </div>
      <div>
      <Editable style={{marginBottom:"10px", paddingBottom:"5px"}}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
      />
      </div>
    </Slate>
    </div>
    </div>
    <button type="submit">Post</button>
    </form>
    </div>
    
  ):(
    <Fragment>
        
        <div style={{marginTop:"100px"}}>
                <div>
                  <div style={{letterSpacing:"3.5px", textAlign:"center"}}> 
                    <h1> <Link to="/forum"><ArrowBackIos/></Link> &nbsp;&nbsp; VIEW YOUR QUESTION</h1>
                  </div>
                  <br></br>
                   <div >
                    <div key={post._id} style={{margin:"3% 2%" , padding:"3% 3%"}} class="border rounded">
                      <h2> <Link to={`/forum/show/${post._id}`}> {post.doubt} </Link></h2>
                      <h5>
                      <span class="badge badge-pill badge-dark"> {post.category}</span>
                      <span class="badge badge-pill badge-light"> Posted by : <Link to = {`/profile/${post.member}`}>{post.name}</Link> </span> 
                      </h5>
                      <Slate editor={editor} value={post.description} onChange={value => setValue(post.description)}>
                        <Editable  style={{padding:"1% 1%"}}
                          renderElement={renderElement}
                          renderLeaf={renderLeaf}
                          spellCheck
                          autoFocus
                          readOnly
                          onKeyDown={event => {event.preventDefault()}}              
                        />
                      </Slate>
                      <p className="text-muted"> Date: <Moment format="DD-MM-YYYY HH:mm" date={post.date}/> &nbsp; Comments:{post.n_comments} &nbsp; Likes: {post.likes}
                      <div>    
                          <Link to={`/forum/editpost/${post._id}`}><button class="btn btn-link">Edit</button></Link>
                      </div>
                      </p>
                      </div>
                      </div>
                      </div>
                      </div>
                      <Link to ="/forum/post"><h1 style={{letterSpacing:"3.5px", textAlign:"center"}}>Ask another question</h1></Link>
                      </Fragment>
  )
}


const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  })

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: '<Code snippets appreciated. Describe your query here...../> ',  italic: true }
    ],
  },
]


export default AddPost;