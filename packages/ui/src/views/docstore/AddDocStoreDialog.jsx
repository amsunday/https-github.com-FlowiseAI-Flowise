import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// Material
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, OutlinedInput } from '@mui/material'

// Project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'

// Icons
import { IconX, IconFileStack } from '@tabler/icons'

// API
import documentStoreApi from '@/api/documentstore'

// Hooks

// utils
import useNotifier from '@/utils/useNotifier'

// const
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'

const AddDocStoreDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const portalElement = document.getElementById('portal')

    const dispatch = useDispatch()

    // ==============================|| Snackbar ||============================== //

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [documentStoreName, setDocumentStoreName] = useState('')
    const [documentStoreDesc, setDocumentStoreDesc] = useState('')
    const [dialogType, setDialogType] = useState('ADD')
    const [docStoreId, setDocumentStoreId] = useState()

    useEffect(() => {
        setDialogType(dialogProps.type)
        if (dialogProps.type === 'EDIT' && dialogProps.data) {
            setDocumentStoreName(dialogProps.data.name)
            setDocumentStoreDesc(dialogProps.data.description)
            setDocumentStoreId(dialogProps.data.id)
        } else if (dialogProps.type === 'ADD') {
            setDocumentStoreName('')
            setDocumentStoreDesc('')
        }

        return () => {
            setDocumentStoreName('')
            setDocumentStoreDesc('')
        }
    }, [dialogProps])

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    const createDocumentStore = async () => {
        try {
            const obj = {
                name: documentStoreName,
                description: documentStoreDesc
            }
            const createResp = await documentStoreApi.createDocumentStore(obj)
            if (createResp.data) {
                enqueueSnackbar({
                    message: 'New Document Store created.',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                onConfirm(createResp.data.id)
            }
        } catch (err) {
            const errorData = typeof err === 'string' ? err : err.response?.data || `${err.response.data.message}`
            enqueueSnackbar({
                message: `Failed to add new Document Store: ${errorData}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            onCancel()
        }
    }

    const updateDocumentStore = async () => {
        try {
            const saveObj = {
                name: documentStoreName,
                description: documentStoreDesc
            }

            const saveResp = await documentStoreApi.updateDocumentStore(docStoreId, saveObj)
            if (saveResp.data) {
                enqueueSnackbar({
                    message: 'Document Store Updated!',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                onConfirm(saveResp.data.id)
            }
        } catch (error) {
            const errorData = error.response?.data || `${error.response?.status}: ${error.response?.statusText}`
            enqueueSnackbar({
                message: `Failed to update Document Store: ${errorData}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            onCancel()
        }
    }

    const component = show ? (
        <Dialog
            fullWidth
            maxWidth='md'
            open={show}
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle style={{ fontSize: '1rem' }} id='alert-dialog-title'>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            marginRight: 10,
                            borderRadius: '50%',
                            backgroundColor: 'white'
                        }}
                    >
                        <IconFileStack
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: 7,
                                borderRadius: '50%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    {'Document Store'}
                </div>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>
                            Name<span style={{ color: 'red' }}>&nbsp;*</span>
                        </Typography>

                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        type='string'
                        disabled={dialogType === 'EDIT'}
                        fullWidth
                        key='documentStoreName'
                        onChange={(e) => setDocumentStoreName(e.target.value)}
                        value={documentStoreName ?? ''}
                    />
                </Box>
                <Box sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>Description</Typography>

                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        multiline={true}
                        rows={2}
                        sx={{ mt: 1 }}
                        type='string'
                        fullWidth
                        key='documentStoreDesc'
                        onChange={(e) => setDocumentStoreDesc(e.target.value)}
                        value={documentStoreDesc ?? ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <StyledButton color='error' variant='contained' onClick={() => onCancel()}>
                    Cancel
                </StyledButton>
                <StyledButton
                    disabled={!documentStoreName}
                    variant='contained'
                    onClick={() => (dialogType === 'ADD' ? createDocumentStore() : updateDocumentStore())}
                >
                    {dialogProps.confirmButtonName}
                </StyledButton>
            </DialogActions>
            <ConfirmDialog />
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

AddDocStoreDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default AddDocStoreDialog
