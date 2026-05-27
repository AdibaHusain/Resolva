import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintApi } from '../api/complaint.api';
import toast from 'react-hot-toast';

export const useMyComplaints = (params) =>
  useQuery({
    queryKey: ['complaints', 'mine', params],
    queryFn:  () => complaintApi.getMine(params).then(r => r.data.data),
  });

export const useAllComplaints = (params) =>
  useQuery({
    queryKey: ['complaints', 'all', params],
    queryFn:  () => complaintApi.getAll(params).then(r => r.data.data),
  });

export const useComplaint = (id) =>
  useQuery({
    queryKey: ['complaint', id],
    queryFn:  () => complaintApi.getById(id).then(r => r.data.data),
    enabled:  !!id,
  });

export const useComplaintTimeline = (id) =>
  useQuery({
    queryKey: ['timeline', id],
    queryFn:  () => complaintApi.getTimeline(id).then(r => r.data.data),
    enabled:  !!id,
  });

export const useCreateComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => complaintApi.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Submission failed';
      toast.error(msg);
    },
  });
};

export const useVoteComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => complaintApi.vote(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['complaint', id] });
      qc.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Vote recorded!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not vote'),
  });
};