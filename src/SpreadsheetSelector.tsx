// @ts-nocheck

import { useEffect, useState, useContext, useMemo, createContext } from 'react';
import { SpreadsheetContext } from './App';
import { getSpreadsheetName, getSpreadsheetLink, getSpreadsheet } from './gapi';
import editIcon from './edit-2.svg';
import closeIcon from './x.svg';

const url_header = 'https://docs.google.com/spreadsheets/d/'

export default function SpreadsheetSelector() {
    const [value, setValue] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [isEditMode, setEditMode] = useState(false);
    const [hasPermission, setPermission] = useState(true);

    const { spreadsheet, setSpreadsheet } = useContext(SpreadsheetContext);

    useEffect(() => {
        if (spreadsheet && Object.keys(spreadsheet).length != 0) {
            const name = getSpreadsheetName(spreadsheet);
            setName(name);
        } else {
            setEditMode(true);
        }

    }, [spreadsheet])

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        let id = getIdFromUrl(value);
        await getSpreadsheet(id).then(
            (spreadsheet) => {
                setValue('');
                setEditMode(false);
                setSpreadsheet(spreadsheet);
                setPermission(true);
                setLoading(false);
            }
        ).catch((error) => {
            console.error(error);
            setPermission(false);
            setLoading(false);
        })


    }

    function getIdFromUrl(url) {
        let id = '';
        if (url.startsWith(url_header)) {
            id = url.replace(url_header, '');
            let i = id.indexOf('/');
            id = id.slice(0, i);
        }
        else {
            id = url;
        }
        return id;
    }

    function enterEditMode() {
        setValue('');
        setEditMode(true);
    }

    const spreadsheetInput = isEditMode
        ? <input type='text' id='spreadsheet-input' value={value} onChange={(e) => setValue(e.target.value)} />
        : <a href={getSpreadsheetLink(spreadsheet)}>{name}</a>;

    const editButton = isEditMode
        ? <img className="edit-button" src={closeIcon} onClick={() => setEditMode(false)} />
        : <img className="edit-button" src={editIcon} onClick={enterEditMode} />;


    return (
        <div>
            <div className="spreadsheet-selector | bg-light">
                <form onSubmit={async (e) => { await handleSubmit(e) }}>

                    {/* <p>Current spreadsheet: <a href={getSpreadsheetLink(spreadsheet)}>{name}</a></p>
<input type='text' id='spreadsheet-input' value={value} onChange={(e) => setValue(e.target.value)}>
</input> */}

                    <div className="spreadsheetInput">
                        {spreadsheetInput}
                    </div>

                    <div>
                        {editButton}
                    </div>




                </form >

            </div>
            {hasPermission ? null : <p>You don't have permission!</p>}
            {isLoading ? <p>Loading...</p> : null}
        </div>


    )
}