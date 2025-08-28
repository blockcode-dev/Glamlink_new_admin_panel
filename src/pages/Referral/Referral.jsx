/** @format */
import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { useNavigate } from "react-router";
import { Box } from "@material-ui/core";
import { GetAllReferral } from "../../services/Api/UserApi";

const Referral = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 20,
        },
        sortField: null,
        sortOrder: null,
    });

    // Fetch list of users who signed up with referral codes
    const getData = async () => {
        try {
            setLoading(true);
            let result = await GetAllReferral(localStorage.getItem("adminToken"));
            const newData = result.data.data.map((item, index) => ({
                ...item,
                index: index + 1,
            }));
            setData(newData);
        } catch (e) {
            console.log(e);
            if (e.response && e.response.status === 403) {
                navigate("/error401");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sortField: sorter.field,
            sortOrder: sorter.order,
        });
    };

    const columns = [
        {
            title: "S.No.",
            dataIndex: "index",
            width: "6%",
        },
        {
            title: "User Name",
            dataIndex: ["user_profile", "name"],
            width: "20%",
            render: (text, record) => (
                <span>{record.user_profile?.name || "-"}</span>
            ),
        },
        {
            title: "User Email",
            dataIndex: "email",
            width: "20%",
        },
        // {
        //     title: "Referral Code Used",
        //     dataIndex: "referred_by",
        //     width: "15%",
        //     render: (_, record) => (
        //         <Tag color="blue">{record.referred_by || "-"}</Tag>
        //     ),
        // },
        {
            title: "Referrer Name",
            dataIndex: ["referrer", "user_profile", "name"],
            width: "20%",
            render: (_, record) =>
                record.referrer?.user_profile?.name ? (
                    <span>{record.referrer.user_profile.name}</span>
                ) : (
                    "-"
                ),
        },
        {
            title: "Referrer Code",
            dataIndex: ["referrer", "referral_code"],
            width: "15%",
            render: (_, record) =>
                record.referrer?.referral_code ? (
                    <Tag color="green">{record.referrer.referral_code}</Tag>
                ) : (
                    "-"
                ),
        },
    ];

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="20px"
            >
                <div>
                    <h3 className="page-title">Referral Signups</h3>
                    <p className="page-sub-title">
                        View users who signed up with a referral code and their referrer.
                    </p>
                </div>
            </Box>

            <Table
                columns={columns}
                rowKey={(record) => record.id}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 900 }} // allows horizontal scroll if content is wide
            />
        </Box>
    );
};

export default Referral;
