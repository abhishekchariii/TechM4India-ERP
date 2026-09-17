import { useEffect, useState } from 'react';
import api from '../services/api';
import './CMS.css';

type Tab = 'pages' | 'blogs' | 'events' | 'faqs' | 'team';

interface WebsitePage {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  authorName?: string;
  category?: string;
  tags?: string;
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EventItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  imageUrl?: string;
  registrationUrl?: string;
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Faq {
  id: number;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  socialLinks?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'pages', label: 'Pages', icon: '🌐' },
  { key: 'blogs', label: 'Blogs', icon: '📝' },
  { key: 'events', label: 'Events', icon: '📅' },
  { key: 'faqs', label: 'FAQs', icon: '❓' },
  { key: 'team', label: 'Team', icon: '👥' },
];

const emptyPage = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  imageUrl: '',
  status: 'DRAFT',
  publishedAt: '',
};

const emptyBlog = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  authorName: '',
  category: '',
  tags: '',
  status: 'DRAFT',
  isFeatured: false,
  publishedAt: '',
};

const emptyEvent = {
  title: '',
  slug: '',
  description: '',
  eventDate: '',
  endDate: '',
  location: '',
  imageUrl: '',
  registrationUrl: '',
  status: 'DRAFT',
  isFeatured: false,
  publishedAt: '',
};

const emptyFaq = {
  question: '',
  answer: '',
  category: '',
  displayOrder: '0',
  isActive: true,
};

const emptyTeam = {
  name: '',
  designation: '',
  bio: '',
  imageUrl: '',
  email: '',
  phone: '',
  socialLinks: '',
  displayOrder: '0',
  isActive: true,
};

function CMS() {
  const [activeTab, setActiveTab] = useState<Tab>('pages');

  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const [pageForm, setPageForm] = useState(emptyPage);
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [faqForm, setFaqForm] = useState(emptyFaq);
  const [teamForm, setTeamForm] = useState(emptyTeam);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const getError = (err: any, fallback: string) =>
    err?.response?.data?.message || fallback;

  const loadCurrentTab = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'pages') {
        const response = await api.get('/cms/pages');
        setPages(response.data);
      }

      if (activeTab === 'blogs') {
        const response = await api.get('/cms/blogs');
        setBlogs(response.data);
      }

      if (activeTab === 'events') {
        const response = await api.get('/cms/events');
        setEvents(response.data);
      }

      if (activeTab === 'faqs') {
        const response = await api.get('/cms/faqs');
        setFaqs(response.data);
      }

      if (activeTab === 'team') {
        const response = await api.get('/cms/team');
        setTeam(response.data);
      }
    } catch (err: any) {
      setError(getError(err, 'Unable to load CMS records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditingId(null);
    setError('');
    loadCurrentTab();
  }, [activeTab]);

  const resetForm = () => {
    setPageForm(emptyPage);
    setBlogForm(emptyBlog);
    setEventForm(emptyEvent);
    setFaqForm(emptyFaq);
    setTeamForm(emptyTeam);
    setEditingId(null);
    setError('');
  };

  const handlePageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setPageForm((current) => ({ ...current, [name]: value }));
  };

  const handleBlogChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    setBlogForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleEventChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    setEventForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleFaqChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    setFaqForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleTeamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    setTeamForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const submitPage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pageForm.title.trim() || !pageForm.slug.trim() || !pageForm.content.trim()) {
      setError('Title, slug and content are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        title: pageForm.title.trim(),
        slug: pageForm.slug.trim(),
        content: pageForm.content.trim(),
        status: pageForm.status,
      };

      if (pageForm.excerpt.trim()) payload.excerpt = pageForm.excerpt.trim();
      if (pageForm.metaTitle.trim()) payload.metaTitle = pageForm.metaTitle.trim();
      if (pageForm.metaDescription.trim()) {
        payload.metaDescription = pageForm.metaDescription.trim();
      }
      if (pageForm.imageUrl.trim()) payload.imageUrl = pageForm.imageUrl.trim();
      if (pageForm.publishedAt) {
        payload.publishedAt = new Date(pageForm.publishedAt).toISOString();
      }

      if (editingId !== null) {
        await api.patch(`/cms/pages/${editingId}`, payload);
      } else {
        await api.post('/cms/pages', payload);
      }

      resetForm();
      await loadCurrentTab();
    } catch (err: any) {
      setError(getError(err, 'Unable to save website page.'));
    } finally {
      setSaving(false);
    }
  };

  const submitBlog = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!blogForm.title.trim() || !blogForm.slug.trim() || !blogForm.content.trim()) {
      setError('Title, slug and content are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        title: blogForm.title.trim(),
        slug: blogForm.slug.trim(),
        content: blogForm.content.trim(),
        status: blogForm.status,
        isFeatured: blogForm.isFeatured,
      };

      if (blogForm.excerpt.trim()) payload.excerpt = blogForm.excerpt.trim();
      if (blogForm.coverImageUrl.trim()) {
        payload.coverImageUrl = blogForm.coverImageUrl.trim();
      }
      if (blogForm.authorName.trim()) payload.authorName = blogForm.authorName.trim();
      if (blogForm.category.trim()) payload.category = blogForm.category.trim();
      if (blogForm.tags.trim()) payload.tags = blogForm.tags.trim();
      if (blogForm.publishedAt) {
        payload.publishedAt = new Date(blogForm.publishedAt).toISOString();
      }

      if (editingId !== null) {
        await api.patch(`/cms/blogs/${editingId}`, payload);
      } else {
        await api.post('/cms/blogs', payload);
      }

      resetForm();
      await loadCurrentTab();
    } catch (err: any) {
      setError(getError(err, 'Unable to save blog.'));
    } finally {
      setSaving(false);
    }
  };

  const submitEvent = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !eventForm.title.trim() ||
      !eventForm.slug.trim() ||
      !eventForm.eventDate
    ) {
      setError('Title, slug and event date are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        title: eventForm.title.trim(),
        slug: eventForm.slug.trim(),
        eventDate: new Date(eventForm.eventDate).toISOString(),
        status: eventForm.status,
        isFeatured: eventForm.isFeatured,
      };

      if (eventForm.description.trim()) {
        payload.description = eventForm.description.trim();
      }

      if (eventForm.endDate) {
        payload.endDate = new Date(eventForm.endDate).toISOString();
      }

      if (eventForm.location.trim()) {
        payload.location = eventForm.location.trim();
      }

      if (eventForm.imageUrl.trim()) {
        payload.imageUrl = eventForm.imageUrl.trim();
      }

      if (eventForm.registrationUrl.trim()) {
        payload.registrationUrl = eventForm.registrationUrl.trim();
      }

      if (eventForm.publishedAt) {
        payload.publishedAt = new Date(eventForm.publishedAt).toISOString();
      }

      if (editingId !== null) {
        await api.patch(`/cms/events/${editingId}`, payload);
      } else {
        await api.post('/cms/events', payload);
      }

      resetForm();
      await loadCurrentTab();
    } catch (err: any) {
      setError(getError(err, 'Unable to save event.'));
    } finally {
      setSaving(false);
    }
  };

  const submitFaq = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }

    const displayOrder = Number(faqForm.displayOrder);

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError('Display order must be a non-negative integer.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        displayOrder,
        isActive: faqForm.isActive,
      };

      if (faqForm.category.trim()) {
        payload.category = faqForm.category.trim();
      }

      if (editingId !== null) {
        await api.patch(`/cms/faqs/${editingId}`, payload);
      } else {
        await api.post('/cms/faqs', payload);
      }

      resetForm();
      await loadCurrentTab();
    } catch (err: any) {
      setError(getError(err, 'Unable to save FAQ.'));
    } finally {
      setSaving(false);
    }
  };

  const submitTeam = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!teamForm.name.trim() || !teamForm.designation.trim()) {
      setError('Name and designation are required.');
      return;
    }

    const displayOrder = Number(teamForm.displayOrder);

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError('Display order must be a non-negative integer.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        name: teamForm.name.trim(),
        designation: teamForm.designation.trim(),
        displayOrder,
        isActive: teamForm.isActive,
      };

      if (teamForm.bio.trim()) payload.bio = teamForm.bio.trim();
      if (teamForm.imageUrl.trim()) payload.imageUrl = teamForm.imageUrl.trim();
      if (teamForm.email.trim()) payload.email = teamForm.email.trim();
      if (teamForm.phone.trim()) payload.phone = teamForm.phone.trim();
      if (teamForm.socialLinks.trim()) {
        payload.socialLinks = teamForm.socialLinks.trim();
      }

      if (editingId !== null) {
        await api.patch(`/cms/team/${editingId}`, payload);
      } else {
        await api.post('/cms/team', payload);
      }

      resetForm();
      await loadCurrentTab();
    } catch (err: any) {
      setError(getError(err, 'Unable to save team member.'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setError('');

    if (activeTab === 'pages') {
      setPageForm({
        title: item.title || '',
        slug: item.slug || '',
        excerpt: item.excerpt || '',
        content: item.content || '',
        metaTitle: item.metaTitle || '',
        metaDescription: item.metaDescription || '',
        imageUrl: item.imageUrl || '',
        status: item.status || 'DRAFT',
        publishedAt: item.publishedAt
          ? new Date(item.publishedAt).toISOString().slice(0, 16)
          : '',
      });
    }

    if (activeTab === 'blogs') {
      setBlogForm({
        title: item.title || '',
        slug: item.slug || '',
        excerpt: item.excerpt || '',
        content: item.content || '',
        coverImageUrl: item.coverImageUrl || '',
        authorName: item.authorName || '',
        category: item.category || '',
        tags: item.tags || '',
        status: item.status || 'DRAFT',
        isFeatured: Boolean(item.isFeatured),
        publishedAt: item.publishedAt
          ? new Date(item.publishedAt).toISOString().slice(0, 16)
          : '',
      });
    }

    if (activeTab === 'events') {
      setEventForm({
        title: item.title || '',
        slug: item.slug || '',
        description: item.description || '',
        eventDate: item.eventDate
          ? new Date(item.eventDate).toISOString().slice(0, 16)
          : '',
        endDate: item.endDate
          ? new Date(item.endDate).toISOString().slice(0, 16)
          : '',
        location: item.location || '',
        imageUrl: item.imageUrl || '',
        registrationUrl: item.registrationUrl || '',
        status: item.status || 'DRAFT',
        isFeatured: Boolean(item.isFeatured),
        publishedAt: item.publishedAt
          ? new Date(item.publishedAt).toISOString().slice(0, 16)
          : '',
      });
    }

    if (activeTab === 'faqs') {
      setFaqForm({
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || '',
        displayOrder: String(item.displayOrder ?? 0),
        isActive: Boolean(item.isActive),
      });
    }

    if (activeTab === 'team') {
      setTeamForm({
        name: item.name || '',
        designation: item.designation || '',
        bio: item.bio || '',
        imageUrl: item.imageUrl || '',
        email: item.email || '',
        phone: item.phone || '',
        socialLinks: item.socialLinks || '',
        displayOrder: String(item.displayOrder ?? 0),
        isActive: Boolean(item.isActive),
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this CMS record?')) {
      return;
    }

    try {
      setError('');

      if (activeTab === 'pages') {
        await api.delete(`/cms/pages/${id}`);
      }

      if (activeTab === 'blogs') {
        await api.delete(`/cms/blogs/${id}`);
      }

      if (activeTab === 'events') {
        await api.delete(`/cms/events/${id}`);
      }

      if (activeTab === 'faqs') {
        await api.delete(`/cms/faqs/${id}`);
      }

      if (activeTab === 'team') {
        await api.delete(`/cms/team/${id}`);
      }

      if (editingId === id) {
        resetForm();
      }

      await loadCurrentTab();
    } catch (err: any) {
      setError(getError(err, 'Unable to delete CMS record.'));
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPages = () => (
    <>
      <div className="cms-form-card">
        <div className="cms-section-header">
          <div>
            <h2>{editingId ? 'Edit Website Page' : 'Create Website Page'}</h2>
            <p>Manage website pages and SEO content.</p>
          </div>

          {editingId && (
            <button className="cms-secondary-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submitPage} className="cms-form">
          <div className="cms-grid">
            <div className="cms-field">
              <label>Title *</label>
              <input
                name="title"
                value={pageForm.title}
                onChange={handlePageChange}
                placeholder="About TechM4India"
              />
            </div>

            <div className="cms-field">
              <label>Slug *</label>
              <input
                name="slug"
                value={pageForm.slug}
                onChange={handlePageChange}
                placeholder="about-techm4india"
              />
            </div>

            <div className="cms-field">
              <label>Status</label>
              <select
                name="status"
                value={pageForm.status}
                onChange={handlePageChange}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            </div>

            <div className="cms-field">
              <label>Image URL</label>
              <input
                name="imageUrl"
                value={pageForm.imageUrl}
                onChange={handlePageChange}
                placeholder="https://..."
              />
            </div>

            <div className="cms-field full">
              <label>Excerpt</label>
              <textarea
                name="excerpt"
                value={pageForm.excerpt}
                onChange={handlePageChange}
                rows={3}
                placeholder="Short page summary..."
              />
            </div>

            <div className="cms-field full">
              <label>Content *</label>
              <textarea
                name="content"
                value={pageForm.content}
                onChange={handlePageChange}
                rows={7}
                placeholder="Website page content..."
              />
            </div>

            <div className="cms-field">
              <label>Meta Title</label>
              <input
                name="metaTitle"
                value={pageForm.metaTitle}
                onChange={handlePageChange}
                placeholder="SEO title"
              />
            </div>

            <div className="cms-field">
              <label>Published At</label>
              <input
                name="publishedAt"
                type="datetime-local"
                value={pageForm.publishedAt}
                onChange={handlePageChange}
              />
            </div>

            <div className="cms-field full">
              <label>Meta Description</label>
              <textarea
                name="metaDescription"
                value={pageForm.metaDescription}
                onChange={handlePageChange}
                rows={3}
                placeholder="SEO description..."
              />
            </div>
          </div>

          <FormButtons saving={saving} editing={editingId !== null} />
        </form>
      </div>

      <div className="cms-table-card">
        <TableHeader title="Website Pages" count={pages.length} />

        {loading ? (
          <Loading />
        ) : pages.length === 0 ? (
          <Empty icon="🌐" text="No website pages found." />
        ) : (
          <div className="cms-table-wrapper">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Page</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pages.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.title}</strong>
                      {item.excerpt && <span className="cms-subtext">{item.excerpt}</span>}
                    </td>
                    <td>{item.slug}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{formatDate(item.publishedAt)}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderBlogs = () => (
    <>
      <div className="cms-form-card">
        <div className="cms-section-header">
          <div>
            <h2>{editingId ? 'Edit Blog' : 'Create Blog'}</h2>
            <p>Manage articles, categories and featured content.</p>
          </div>

          {editingId && (
            <button className="cms-secondary-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submitBlog} className="cms-form">
          <div className="cms-grid">
            <div className="cms-field">
              <label>Title *</label>
              <input name="title" value={blogForm.title} onChange={handleBlogChange} />
            </div>

            <div className="cms-field">
              <label>Slug *</label>
              <input name="slug" value={blogForm.slug} onChange={handleBlogChange} />
            </div>

            <div className="cms-field">
              <label>Author</label>
              <input name="authorName" value={blogForm.authorName} onChange={handleBlogChange} />
            </div>

            <div className="cms-field">
              <label>Category</label>
              <input name="category" value={blogForm.category} onChange={handleBlogChange} />
            </div>

            <div className="cms-field">
              <label>Status</label>
              <select name="status" value={blogForm.status} onChange={handleBlogChange}>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            </div>

            <div className="cms-field">
              <label>Published At</label>
              <input
                name="publishedAt"
                type="datetime-local"
                value={blogForm.publishedAt}
                onChange={handleBlogChange}
              />
            </div>

            <div className="cms-field">
              <label>Cover Image URL</label>
              <input name="coverImageUrl" value={blogForm.coverImageUrl} onChange={handleBlogChange} />
            </div>

            <div className="cms-field">
              <label>Tags</label>
              <input name="tags" value={blogForm.tags} onChange={handleBlogChange} placeholder="technology, education" />
            </div>

            <div className="cms-field full">
              <label>Excerpt</label>
              <textarea name="excerpt" value={blogForm.excerpt} onChange={handleBlogChange} rows={3} />
            </div>

            <div className="cms-field full">
              <label>Content *</label>
              <textarea name="content" value={blogForm.content} onChange={handleBlogChange} rows={7} />
            </div>

            <label className="cms-checkbox">
              <input
                type="checkbox"
                name="isFeatured"
                checked={blogForm.isFeatured}
                onChange={handleBlogChange}
              />
              <span>Featured Blog</span>
            </label>
          </div>

          <FormButtons saving={saving} editing={editingId !== null} />
        </form>
      </div>

      <div className="cms-table-card">
        <TableHeader title="Blogs" count={blogs.length} />

        {loading ? (
          <Loading />
        ) : blogs.length === 0 ? (
          <Empty icon="📝" text="No blogs found." />
        ) : (
          <div className="cms-table-wrapper">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Blog</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {blogs.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.title}</strong>
                      {item.authorName && <span className="cms-subtext">By {item.authorName}</span>}
                    </td>
                    <td>{item.category || '-'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.isFeatured ? '⭐ Yes' : 'No'}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderEvents = () => (
    <>
      <div className="cms-form-card">
        <div className="cms-section-header">
          <div>
            <h2>{editingId ? 'Edit Event' : 'Create Event'}</h2>
            <p>Manage website events and registration information.</p>
          </div>

          {editingId && (
            <button className="cms-secondary-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submitEvent} className="cms-form">
          <div className="cms-grid">
            <div className="cms-field">
              <label>Title *</label>
              <input name="title" value={eventForm.title} onChange={handleEventChange} />
            </div>

            <div className="cms-field">
              <label>Slug *</label>
              <input name="slug" value={eventForm.slug} onChange={handleEventChange} />
            </div>

            <div className="cms-field">
              <label>Event Date *</label>
              <input
                name="eventDate"
                type="datetime-local"
                value={eventForm.eventDate}
                onChange={handleEventChange}
              />
            </div>

            <div className="cms-field">
              <label>End Date</label>
              <input
                name="endDate"
                type="datetime-local"
                value={eventForm.endDate}
                onChange={handleEventChange}
              />
            </div>

            <div className="cms-field">
              <label>Location</label>
              <input name="location" value={eventForm.location} onChange={handleEventChange} />
            </div>

            <div className="cms-field">
              <label>Status</label>
              <select name="status" value={eventForm.status} onChange={handleEventChange}>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            </div>

            <div className="cms-field">
              <label>Image URL</label>
              <input name="imageUrl" value={eventForm.imageUrl} onChange={handleEventChange} />
            </div>

            <div className="cms-field">
              <label>Registration URL</label>
              <input name="registrationUrl" value={eventForm.registrationUrl} onChange={handleEventChange} />
            </div>

            <div className="cms-field full">
              <label>Description</label>
              <textarea name="description" value={eventForm.description} onChange={handleEventChange} rows={5} />
            </div>

            <div className="cms-field">
              <label>Published At</label>
              <input
                name="publishedAt"
                type="datetime-local"
                value={eventForm.publishedAt}
                onChange={handleEventChange}
              />
            </div>

            <label className="cms-checkbox">
              <input
                type="checkbox"
                name="isFeatured"
                checked={eventForm.isFeatured}
                onChange={handleEventChange}
              />
              <span>Featured Event</span>
            </label>
          </div>

          <FormButtons saving={saving} editing={editingId !== null} />
        </form>
      </div>

      <div className="cms-table-card">
        <TableHeader title="Events" count={events.length} />

        {loading ? (
          <Loading />
        ) : events.length === 0 ? (
          <Empty icon="📅" text="No events found." />
        ) : (
          <div className="cms-table-wrapper">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.title}</strong>
                      <span className="cms-subtext">{item.slug}</span>
                    </td>
                    <td>{formatDate(item.eventDate)}</td>
                    <td>{item.location || '-'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.isFeatured ? '⭐ Yes' : 'No'}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderFaqs = () => (
    <>
      <div className="cms-form-card">
        <div className="cms-section-header">
          <div>
            <h2>{editingId ? 'Edit FAQ' : 'Create FAQ'}</h2>
            <p>Manage frequently asked questions displayed on the website.</p>
          </div>

          {editingId && (
            <button className="cms-secondary-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submitFaq} className="cms-form">
          <div className="cms-grid">
            <div className="cms-field full">
              <label>Question *</label>
              <input name="question" value={faqForm.question} onChange={handleFaqChange} />
            </div>

            <div className="cms-field">
              <label>Category</label>
              <input name="category" value={faqForm.category} onChange={handleFaqChange} />
            </div>

            <div className="cms-field">
              <label>Display Order</label>
              <input
                name="displayOrder"
                type="number"
                min="0"
                step="1"
                value={faqForm.displayOrder}
                onChange={handleFaqChange}
              />
            </div>

            <div className="cms-field full">
              <label>Answer *</label>
              <textarea name="answer" value={faqForm.answer} onChange={handleFaqChange} rows={6} />
            </div>

            <label className="cms-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={faqForm.isActive}
                onChange={handleFaqChange}
              />
              <span>Active FAQ</span>
            </label>
          </div>

          <FormButtons saving={saving} editing={editingId !== null} />
        </form>
      </div>

      <div className="cms-table-card">
        <TableHeader title="FAQs" count={faqs.length} />

        {loading ? (
          <Loading />
        ) : faqs.length === 0 ? (
          <Empty icon="❓" text="No FAQs found." />
        ) : (
          <div className="cms-table-wrapper">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {faqs.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.question}</strong>
                      <span className="cms-subtext">{item.answer}</span>
                    </td>
                    <td>{item.category || '-'}</td>
                    <td>{item.displayOrder}</td>
                    <td>
                      <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderTeam = () => (
    <>
      <div className="cms-form-card">
        <div className="cms-section-header">
          <div>
            <h2>{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
            <p>Manage team profiles displayed on the public website.</p>
          </div>

          {editingId && (
            <button className="cms-secondary-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submitTeam} className="cms-form">
          <div className="cms-grid">
            <div className="cms-field">
              <label>Name *</label>
              <input name="name" value={teamForm.name} onChange={handleTeamChange} />
            </div>

            <div className="cms-field">
              <label>Designation *</label>
              <input name="designation" value={teamForm.designation} onChange={handleTeamChange} />
            </div>

            <div className="cms-field">
              <label>Email</label>
              <input name="email" type="email" value={teamForm.email} onChange={handleTeamChange} />
            </div>

            <div className="cms-field">
              <label>Phone</label>
              <input name="phone" value={teamForm.phone} onChange={handleTeamChange} />
            </div>

            <div className="cms-field">
              <label>Image URL</label>
              <input name="imageUrl" value={teamForm.imageUrl} onChange={handleTeamChange} />
            </div>

            <div className="cms-field">
              <label>Display Order</label>
              <input
                name="displayOrder"
                type="number"
                min="0"
                step="1"
                value={teamForm.displayOrder}
                onChange={handleTeamChange}
              />
            </div>

            <div className="cms-field full">
              <label>Bio</label>
              <textarea name="bio" value={teamForm.bio} onChange={handleTeamChange} rows={5} />
            </div>

            <div className="cms-field full">
              <label>Social Links</label>
              <textarea
                name="socialLinks"
                value={teamForm.socialLinks}
                onChange={handleTeamChange}
                rows={3}
                placeholder="Instagram / LinkedIn / Facebook links"
              />
            </div>

            <label className="cms-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={teamForm.isActive}
                onChange={handleTeamChange}
              />
              <span>Active Team Member</span>
            </label>
          </div>

          <FormButtons saving={saving} editing={editingId !== null} />
        </form>
      </div>

      <div className="cms-table-card">
        <TableHeader title="Team Members" count={team.length} />

        {loading ? (
          <Loading />
        ) : team.length === 0 ? (
          <Empty icon="👥" text="No team members found." />
        ) : (
          <div className="cms-table-wrapper">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {team.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.name}</strong>
                      <span className="cms-subtext">{item.designation}</span>
                    </td>
                    <td>
                      {item.email || item.phone || '-'}
                    </td>
                    <td>{item.displayOrder}</td>
                    <td>
                      <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="cms-page">
      <div className="cms-header">
        <div>
          <span className="cms-eyebrow">CONTENT MANAGEMENT</span>
          <h1>Website CMS</h1>
          <p>Manage website pages, blogs, events, FAQs and team content.</p>
        </div>

        <div className="cms-total-card">
          <strong>
            {pages.length + blogs.length + events.length + faqs.length + team.length}
          </strong>
          <span>Total Records</span>
        </div>
      </div>

      {error && (
        <div className="cms-error">
          ⚠️ {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}

      <div className="cms-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'cms-tab active' : 'cms-tab'}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pages' && renderPages()}
      {activeTab === 'blogs' && renderBlogs()}
      {activeTab === 'events' && renderEvents()}
      {activeTab === 'faqs' && renderFaqs()}
      {activeTab === 'team' && renderTeam()}
    </div>
  );
}

function FormButtons({
  saving,
  editing,
}: {
  saving: boolean;
  editing: boolean;
}) {
  return (
    <div className="cms-form-actions">
      <button className="cms-primary-button" type="submit" disabled={saving}>
        {saving ? 'Saving...' : editing ? 'Update Record' : 'Create Record'}
      </button>

      <button
        className="cms-secondary-button"
        type="button"
        onClick={() => window.location.reload()}
        disabled={saving}
      >
        Clear
      </button>
    </div>
  );
}

function TableHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="cms-section-header">
      <div>
        <h2>{title}</h2>
        <p>Manage and maintain your website content.</p>
      </div>

      <span className="cms-record-count">{count} Records</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`cms-status ${status.toLowerCase().replace('_', '-')}`}>
      {status}
    </span>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="cms-actions">
      <button className="cms-edit-button" onClick={onEdit}>
        Edit
      </button>

      <button className="cms-delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

function Loading() {
  return <div className="cms-empty">Loading content...</div>;
}

function Empty({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="cms-empty">
      <div className="cms-empty-icon">{icon}</div>
      <h3>{text}</h3>
      <p>Create your first record using the form above.</p>
    </div>
  );
}

export default CMS;