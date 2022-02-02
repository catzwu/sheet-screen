// @ts-nocheck

import { useEffect, useState, useContext } from 'react';
import { SpreadsheetContext } from './App';
import { getSpreadsheetName, getSpreadsheetId, getSheetRange, getValuesFromRange, getHeadings } from './gapi';

export default function Gallery(props) {

    const [values, setValues] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [maxRow, setMaxRow] = useState(Number.MAX_SAFE_INTEGER);
    const [minRow, setMinRow] = useState(1);
    const { spreadsheet, setSpreadsheet } = useContext(SpreadsheetContext);

    useEffect(() => {
        (async function blah() {
            if (props.selectedSheet) {
                setLoading(true);
                let range = getSheetRange(spreadsheet, props.selectedSheet);
                let values = await getValuesFromRange(getSpreadsheetId(spreadsheet), range);
                setValues(values);
                setLoading(false);
                setCurrentSlide(1);
                setMaxRow(values.length);
            }

        })();
    }, [props.selectedSheet]);

    //TODO detect when rows start, to set after the heading
    //TODO detect when rows end, i.e. the end of the table occurs when there are two or more empty rows


    function getSlide(i) {
        if (values) {
            return <GallerySlide row={values[i]} headings={props.headings} />
        }
        return;
    }

    function nextSlide() {
        let newSlide = currentSlide + 1;
        if (newSlide < maxRow) {
            setCurrentSlide(newSlide);
        }
        if (newSlide + 1 >= maxRow) {
            document.getElementById('next_button').disabled = true;
        } else {
            document.getElementById('next_button').disabled = false;
        }
        if (newSlide - 1 < minRow) {
            document.getElementById('previous_button').disabled = true;
        } else {
            document.getElementById('previous_button').disabled = false;
        }
    }

    function previousSlide() {
        let newSlide = currentSlide - 1;
        if (newSlide >= minRow) {
            setCurrentSlide(newSlide);
        }
        if (newSlide + 1 >= maxRow) {
            document.getElementById('next_button').disabled = true;
        } else {
            document.getElementById('next_button').disabled = false;
        }
        if (newSlide - 1 < minRow) {
            document.getElementById('previous_button').disabled = true;
        } else {
            document.getElementById('previous_button').disabled = false;
        }
    }

    return (
        <div className='gallery | wrapper'>
            <div className="gallery-title">
                <p>{props.selectedSheet}</p>
            </div>
            <div className="gallery-settings">

            </div>
            <div className="gallery-display | bg-contrast shadow-far | wrapper">

                <button className="gallery-control | left | button secondary-button" id='previous_button' onClick={previousSlide}></button>
                <p className="gallery-button-label left">{'<'}</p>
                <div className="gallery-content | wrapper">
                    {getSlide(currentSlide)}
                </div>
                <p className="gallery-button-label right">{'>'}</p>
                <button className="gallery-control | right | button secondary-button" id='next_button' onClick={nextSlide}></button>



            </div>

        </div>
    )
}

function GallerySlide(props) {

    //TODO better edge case handling
    const row = props.row ? props.row : [];

    return (
        <div className='gallery-slide'>
            {row.map(
                (x, i) => {
                    let value = [];
                    if (i < props.headings.length && props.headings[i].checked) {
                        if (props.headings[i].value) {
                            value.push(<p className="row-heading">{props.headings[i].value}</p>);
                        }
                        value.push(<p className="row-value">{x}</p>);
                    }
                    return value;

                }
            )}
        </div>
    )
}