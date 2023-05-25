import React,{useEffect, useState} from 'react';
import Modal from 'react-modal';

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
    background: 'rgba(0, 0, 0, 0.75)',
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

  const getIsAutoClipboard = async () => {
    if (typeof window !== "undefined") {
      const isAutoClipboard = window.localStorage.getItem('isAutoClipboard') ?? "false"
      window.localStorage.setItem('isAutoClipboard', isAutoClipboard)
      setDisabledClipboard(JSON.parse(isAutoClipboard))
    }
  }

  function openModal() {
    getUserName();
    getIsAutoClipboard();
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

  const handleClickSave = (e: any) => {
    window.localStorage.setItem('userName', userName);
    window.localStorage.setItem('isAutoClipboard', disabledClipboard.toString());
    getUserName();
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
        <div className='xl:w-[30vw] md:w-[40vw] w-[60vw] h-full'>
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
          <div className="md:flex md:items-center mb-2">
            <Input
              id="nameInput"
              type="string"
              value={userName}
              label="Name"
              onChange={handleChangeName}
            />
          </div>
          <div className='mb-1'>Auto copy to clipboard</div>
          <div className="flex mb-5">
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
      </Modal>
    </div>
  )
}

export default BtnSetting;