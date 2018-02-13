/**
 * IDVDetails.jsx
 * Created by michaelbray on 2/13/18.
 **/

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { idvAwardTypes } from 'dataMapping/contracts/idvAwardTypes';
import DetailRow from '../DetailRow';

const propTypes = {
    selectedAward: PropTypes.object,
    seeAdditional: PropTypes.func,
    maxChars: PropTypes.number
};

const isEmpty = (field, ignoreDefault) => {
    if (!field) {
        return true;
    }
    if (field === '') {
        return true;
    }
    if (!ignoreDefault && field === ignoreDefault) {
        return true;
    }
    return false;
};

export default class IDVDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            desc: "",
            date: "",
            place: "",
            typeDesc: "",
            price: "",
            overflow: false
        };
    }

    componentDidMount() {
        this.prepareValues(this.props.selectedAward);
    }

    componentWillReceiveProps(nextProps) {
        if (!Object.is(nextProps.selectedAward, this.props.selectedAward)) {
            this.prepareValues(nextProps.selectedAward);
        }
    }

    parsePlaceOfPerformance(award) {
        // Location
        let popPlace = '';

        let cityState = null;
        const city = award.pop_city;
        const stateProvince = award.pop_state_province;

        if (!isEmpty(city) && !isEmpty(stateProvince)) {
            cityState = `${city}, ${stateProvince}`;
        }
        else if (!isEmpty(city)) {
            cityState = city;
        }
        else if (!isEmpty(stateProvince)) {
            cityState = stateProvince;
        }
        if (award.pop_country_code === 'USA') {
            if (!isEmpty(cityState)) {
                popPlace = cityState;
            }
            if (!isEmpty(award.pop_zip)) {
                if (popPlace !== '') {
                    popPlace += ' ';
                }
                popPlace += award.pop_zip;
            }

            if (!isEmpty(award.pop_state_code) && !isEmpty(award.pop_congressional_district)) {
                if (popPlace !== '') {
                    popPlace += '\n';
                }
                popPlace +=
                    `Congressional District: ${award.pop_state_code}-${award.pop_congressional_district}`;
            }
        }
        else if (award.pop_country_code !== 'USA') {
            popPlace = `${award.pop_country}`;
        }

        if (popPlace === '') {
            popPlace = 'Not available';
        }

        return popPlace;
    }

    prepareValues(award) {
        let yearRangeTotal = "";
        let monthRangeTotal = "";
        let description = null;

        // Date Range
        const formattedStartDate = award.period_of_performance_start_date;
        // Convert this datetime into a moment date
        const formattedEndDate = moment(award.latest_transaction.contract_data.ordering_period_end_date);

        const startDate = moment(formattedStartDate, 'M/D/YYYY');
        const endDate = moment(formattedEndDate, 'M/D/YYYY');

        const duration = moment.duration(endDate.diff(startDate));
        const years = duration.years();
        const months = duration.months();

        let popDate = "Not Available";
        if (!isNaN(years)) {
            if (months > 0) {
                if (months === 1) {
                    monthRangeTotal = `${months} month`;
                }
                else {
                    monthRangeTotal = `${months} months`;
                }
            }

            if (years > 0) {
                if (years === 1) {
                    yearRangeTotal = `${years} year`;
                }
                else {
                    yearRangeTotal = `${years} years`;
                }
            }

            let timeRange = '';
            if (monthRangeTotal && yearRangeTotal) {
                timeRange = `(${yearRangeTotal}, ${monthRangeTotal})`;
            }
            else if (monthRangeTotal) {
                timeRange = `(${monthRangeTotal})`;
            }
            else if (yearRangeTotal) {
                timeRange = `(${yearRangeTotal})`;
            }

            popDate = `${formattedStartDate} - ${formattedEndDate.format('M/D/YYYY')} ${timeRange}`;
        }

        if (award.description) {
            description = award.description;
        }
        else {
            description = "Not Available";
        }

        // Award Type
        let awardType = "Not Available";
        if (award.latest_transaction.contract_data.idv_type) {
            awardType = idvAwardTypes[award.latest_transaction.contract_data.idv_type];
        }

        // Pricing
        let pricing = "Not Available";
        if (award.type_of_contract_pricing_description) {
            pricing = award.type_of_contract_pricing_description;
        }

        // char count
        let seeMore = false;
        if (award.description.length > this.props.maxChars) {
            seeMore = true;
        }

        this.setState({
            desc: description,
            overflow: seeMore,
            date: popDate,
            place: this.parsePlaceOfPerformance(award),
            typeDesc: awardType,
            price: pricing
        });
    }

    render() {
        return (
            <div className="contract-wrapper">
                <div className="contract-details">
                    <h3>Contract Details</h3>
                    <hr
                        className="results-divider"
                        ref={(hr) => {
                            this.sectionHr = hr;
                        }} />
                    <table>
                        <tbody>
                            <DetailRow
                                title="Description"
                                value={this.state.desc}
                                overflow={this.state.overflow}
                                maxChars={this.props.maxChars} />
                            <DetailRow
                                title="Period of Performance"
                                value={this.state.date} />
                            <DetailRow
                                title="Primary Place of Performance"
                                value={this.state.place} />
                            <DetailRow
                                title="Contract Award Type"
                                value={this.state.typeDesc} />
                            <DetailRow
                                title="Contract Pricing Type"
                                value={this.state.price} />
                        </tbody>
                    </table>
                </div>
                <button
                    className="see-more"
                    onClick={this.props.seeAdditional}>See Additional Details
                </button>
            </div>
        );
    }
}

IDVDetails.propTypes = propTypes;
