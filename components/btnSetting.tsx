import React,{useEffect, useState} from 'react';
import Modal from 'react-modal';

import ApiUser from "@/helpers/api/user"

import GearIcon from './icons/GearIcon';
import Input from './input';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    color: "white",
    backgroundColor: "#181826",
    border: "1px solid rgb(0, 0, 0)",
  },
  overlay: {
    background: 'rgba(0, 0, 0, 0.60)',
  }
};

interface BtnSettingProps {
  userId: string
  userName: string
  getUserName: Function
  setUserName: Function
}

const BtnSetting: React.FC<BtnSettingProps> = ({userId, userName, getUserName, setUserName}) => {

  const [modalIsOpen, setIsOpen] = React.useState<boolean>(false);
  const [disabledClipboard, setDisabledClipboard] = React.useState<boolean>(false);
  
  const [textCall1, setTextCall1] = React.useState<string>("[");
  const [textCall2, setTextCall2] = React.useState<string>("] Auto join");
  
  const [textFreeChest1, setTextFreeChest1] = React.useState<string>("<LblRed>[");
  const [textFreeChest2, setTextFreeChest2] = React.useState<string>("]</</>> [Free Chest]");

  const getIsAutoClipboard = async () => {
    if (typeof window !== "undefined") {
      const isAutoClipboard = window.localStorage.getItem('isAutoClipboard') ?? "false"
      window.localStorage.setItem('isAutoClipboard', isAutoClipboard)
      setDisabledClipboard(JSON.parse(isAutoClipboard))
    }
  }

  const getTextFreeChest = async () => {
    if (typeof window !== "undefined") {
      const textclipboard = window.localStorage.getItem('textclipboard') ?? JSON.stringify({
        "textCall1": "[",
        "textCall2": "] Auto join",
        "textFreeChest1": "<LblRed>[",
        "textFreeChest2": "]</</>> [Free Chest]"
      })
      window.localStorage.setItem('textclipboard', textclipboard)
      const _textclipboard = JSON.parse(textclipboard)
      setTextCall1(_textclipboard.textCall1)
      setTextCall2(_textclipboard.textCall2)
      setTextFreeChest1(_textclipboard.textFreeChest1)
      setTextFreeChest2(_textclipboard.textFreeChest2)
    }
  }

  function openModal() {
    getUserName();
    getIsAutoClipboard();
    getTextFreeChest()
    setIsOpen(true);
  }

  function afterOpenModal() {
    getUserName();
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleChangeName = (e: any) => {
    const value = e.target.value as string
    setUserName(value);
  }

  const handleChangeTextCall1 = (e: any) => {
    const value = e.target.value as string
    setTextCall1(value);
  }
  const handleChangeTextCall2 = (e: any) => {
    const value = e.target.value as string
    setTextCall2(value);
  }
  const handleChangeTextFreeChest1 = (e: any) => {
    const value = e.target.value as string
    setTextFreeChest1(value);
  }
  const handleChangeTextFreeChest2 = (e: any) => {
    const value = e.target.value as string
    setTextFreeChest2(value);
  }

  const handleClickSave = (e: any) => {
    window.localStorage.setItem('userName', userName);
    window.localStorage.setItem('isAutoClipboard', disabledClipboard.toString());
    const param = {
      userId: userId,
      userName: userName,
      disabledClipboard: disabledClipboard,
      textCall1: textCall1,
      textCall2: textCall2,
      textFreeChest1: textFreeChest1,
      textFreeChest2: textFreeChest2
    }
    localStorage.setItem("textclipboard", JSON.stringify({
      textCall1: textCall1,
      textCall2: textCall2,
      textFreeChest1: textFreeChest1,
      textFreeChest2: textFreeChest2
    }))
    getUserName();
    ApiUser.updateInfoUser(param)
    setIsOpen(false);
  }

  const handleClickCancel = (e: any) => {
    closeModal()
  }

  useEffect(() => {
    getUserName();
  },[])

  return (
    <div>
      <div 
        className="w-[45px] h-[45px] rounded-full bg-purple-800 text-white fixed right-[28px] bottom-[20px] cursor-pointer"
        onClick={openModal}
      >
        <div className="h-full flex justify-center items-center">
          <div className='w-[15px] text-white'>
            <GearIcon />
          </div>
        </div>
      </div>
      <Modal 
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        ariaHideApp={false}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <div className='xl:w-[30vw] md:w-[40vw] w-[60vw] h-full overflow-auto max-h-screen'>
          <div className='text-[22px] mb-3'>Setting</div>
          <div className="md:flex md:items-center mb-3">
            <Input
              id="userInput"
              type="string"
              value={userId.substring(userId.length - 12)}
              label="ID"
              disabled={true}
            />
          </div>
          <div className="md:flex md:items-center mb-3">
            <Input
              id="nameInput"
              type="string"
              value={userName}
              label="Name"
              onChange={handleChangeName}
            />
          </div>
          <div className='border border-[#6346AA] p-2 mb-2 rounded'>
            <div className='mb-2'>Clipboard Boss</div>
            <div className="md:flex md:items-center mb-1">
              <div className='w-[120px] text-left mr-1'>BossName</div>
              <Input
                id="TextCall1Input"
                type="string"
                value={textCall1}
                label=""
                onChange={handleChangeTextCall1}
              />
              <div className='w-[30px] text-center mx-1'>CH1</div>
              <Input
                id="TextCall1Input"
                type="string"
                value={textCall2}
                label=""
                onChange={handleChangeTextCall2}
              />
            </div>
            <div className="text-[10px]">
              Example: { `Robrag ${textCall1}CH1${textCall2}` }
            </div>
          </div>
          <div className='border border-[#6346AA] p-2 mb-2 rounded'>
            <div className='mb-2'>Clipboard Free Reward</div>
            <div className="md:flex md:items-center mb-1">
              <div className='w-[120px] text-left mr-1'>BossName</div>
              <Input
                id="TextCall1Input"
                type="string"
                value={textFreeChest1}
                label=""
                onChange={handleChangeTextFreeChest1}
              />
              <div className='w-[30px] text-center mx-1'>CH1</div>
              <Input
                id="TextFreeChest1Input"
                type="string"
                value={textFreeChest2}
                label=""
                onChange={handleChangeTextFreeChest2}
              />
            </div>
            <div className="text-[10px]">
              Example: { `Robrag ${textFreeChest1}CH1${textFreeChest2}` }
            </div>
          </div>
          <div className='mb-1'>Auto copy free reward text to clipboard</div>
          <div className="flex mb-3">
            <div className={
                `w-[40px] h-[30px] text-center pt-1 transition-all ${!disabledClipboard ? "bg-purple-800 cursor-default" : "bg-purple-500 opacity-60 cursor-pointer"}`
              }
              onClick={ () => setDisabledClipboard(false) }
            >
              On
            </div>
            <div className={
                `w-[40px] h-[30px] text-center pt-1 transition-all ${disabledClipboard ? "bg-purple-800 cursor-default" : "bg-purple-500 opacity-60 cursor-pointer"}`
              }
              onClick={ () => setDisabledClipboard(true) }
            >
              Off
            </div>
          </div>
          <div className='mt-5'>
            <button
              className={
                `
                  transition-all
                  border-2
                  border-[#6346AA]
                  hover:bg-[#7557BC]
                  text-white
                  rounded-sm
                  p-2
                  text-center
                  mr-1
                  text-[12px]
                  w-[60px]
                `
              }
              onClick={handleClickSave}
            >
              Save
            </button>
            <button
              className={
                `
                  transition-all
                  border-2
                  border-[#6346AA]
                  hover:bg-[#7557BC]
                  text-white
                  rounded-sm
                  p-2
                  text-center
                  mr-1
                  text-[12px]
                  w-[60px]
                `
              }
              onClick={handleClickCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BtnSetting;